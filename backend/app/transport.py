"""Transport provider adapters.

OncoReady owns the readiness decision; the trip itself belongs to whichever
provider the program contracts with. Each adapter speaks one provider's API and
normalises the result into :class:`TripResult`, so the rest of the application
never branches on which provider served a ride.

Every adapter implements three verbs:

    estimate(request) -> TripEstimate   price and ETA before committing
    dispatch(request) -> TripResult     create the trip, return its provider id
    cancel(trip_id)   -> None           release it so a fallback can be tried

Credentials come from settings and are never logged. An adapter with no
credentials configured reports ``configured = False`` and raises
:class:`ProviderNotConfigured` rather than attempting a call, so a missing
contract surfaces as a clear operational state instead of an auth error.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Protocol

import httpx

REQUEST_TIMEOUT_SECONDS = 10.0


class ProviderId(str, Enum):
    UBER_HEALTH = "uber-health"
    LYFT_HEALTHCARE = "lyft-healthcare"
    CARELINK_NEMT = "carelink-nemt"


#: Order OncoReady falls through when a dispatch fails. Rideshare first because
#: it recovers in minutes; NEMT last because it is the only provider that can
#: take a stretcher and its scheduling slots are scarce.
FALLBACK_ORDER: tuple[ProviderId, ...] = (
    ProviderId.UBER_HEALTH,
    ProviderId.LYFT_HEALTHCARE,
    ProviderId.CARELINK_NEMT,
)


class ProviderNotConfigured(RuntimeError):
    """Raised when an adapter is asked to act without credentials."""


class ProviderRejected(RuntimeError):
    """Raised when a provider declines the trip. Carries the reason verbatim."""

    def __init__(self, provider: ProviderId, reason: str) -> None:
        super().__init__(f"{provider.value}: {reason}")
        self.provider = provider
        self.reason = reason


@dataclass(frozen=True, slots=True)
class Place:
    """A pickup or drop-off. Latitude and longitude win when both are present."""

    address: str
    latitude: float | None = None
    longitude: float | None = None


@dataclass(frozen=True, slots=True)
class TripRequest:
    """One patient trip, in provider-neutral terms."""

    patient_name: str
    patient_phone: str
    pickup: Place
    dropoff: Place
    #: ISO 8601. ``None`` means dispatch now.
    pickup_at: str | None = None
    wheelchair_accessible: bool = False
    stretcher: bool = False
    #: Free text passed to the driver, e.g. "Use the Napoleon Ave entrance".
    note: str | None = None


@dataclass(frozen=True, slots=True)
class TripEstimate:
    provider: ProviderId
    fare_cents: int
    currency: str
    eta_minutes: int


@dataclass(frozen=True, slots=True)
class TripResult:
    provider: ProviderId
    #: The provider's own id, quoted back in support calls.
    trip_id: str
    status: str
    driver_name: str | None = None
    vehicle_description: str | None = None
    eta_minutes: int | None = None


class TransportAdapter(Protocol):
    provider: ProviderId

    @property
    def configured(self) -> bool: ...

    async def estimate(self, request: TripRequest) -> TripEstimate: ...

    async def dispatch(self, request: TripRequest) -> TripResult: ...

    async def cancel(self, trip_id: str) -> None: ...


class UberHealthAdapter:
    """Uber Health API v1.

    Trips are created and dispatched in two calls so a coordinator can hold an
    estimate in front of a patient before committing to the fare. Uber contacts
    the patient by SMS or voice with the driver details, so the patient needs
    neither a smartphone nor an Uber account.
    """

    provider = ProviderId.UBER_HEALTH
    base_url = "https://api.uber.com/v1/health"

    def __init__(self, client: httpx.AsyncClient, access_token: str | None) -> None:
        self._client = client
        self._access_token = access_token

    @property
    def configured(self) -> bool:
        return bool(self._access_token)

    def _headers(self) -> dict[str, str]:
        if not self._access_token:
            raise ProviderNotConfigured("Uber Health access token is not set")
        return {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
        }

    @staticmethod
    def _place(place: Place) -> dict[str, object]:
        payload: dict[str, object] = {"address": place.address}
        if place.latitude is not None and place.longitude is not None:
            payload["latitude"] = place.latitude
            payload["longitude"] = place.longitude
        return payload

    def _body(self, request: TripRequest) -> dict[str, object]:
        body: dict[str, object] = {
            "guest": {
                "first_name": request.patient_name.split(" ")[0],
                "last_name": " ".join(request.patient_name.split(" ")[1:]) or "-",
                "phone_number": request.patient_phone,
            },
            "pickup": self._place(request.pickup),
            "dropoff": self._place(request.dropoff),
        }
        if request.pickup_at:
            body["pickup_time"] = request.pickup_at
        if request.wheelchair_accessible:
            body["product_type"] = "ASSIST_WAV"
        if request.note:
            body["note_for_driver"] = request.note
        return body

    async def estimate(self, request: TripRequest) -> TripEstimate:
        response = await self._client.post(
            f"{self.base_url}/trips/estimates",
            headers=self._headers(),
            json=self._body(request),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if response.status_code >= 400:
            raise ProviderRejected(self.provider, _reason(response))
        payload = response.json()
        return TripEstimate(
            provider=self.provider,
            fare_cents=int(payload.get("fare", {}).get("value_cents", 0)),
            currency=str(payload.get("fare", {}).get("currency", "USD")),
            eta_minutes=int(payload.get("pickup_eta_minutes", 0)),
        )

    async def dispatch(self, request: TripRequest) -> TripResult:
        created = await self._client.post(
            f"{self.base_url}/trips",
            headers=self._headers(),
            json=self._body(request),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if created.status_code >= 400:
            raise ProviderRejected(self.provider, _reason(created))
        trip = created.json()
        trip_id = str(trip["request_id"])

        # A flexible-ride trip is created held and needs an explicit dispatch;
        # a scheduled one is already committed. Both end up in the same state.
        if trip.get("status") == "pending_dispatch":
            dispatched = await self._client.post(
                f"{self.base_url}/trips/{trip_id}/dispatch",
                headers=self._headers(),
                json={},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            if dispatched.status_code >= 400:
                raise ProviderRejected(self.provider, _reason(dispatched))

        driver = trip.get("driver") or {}
        vehicle = trip.get("vehicle") or {}
        return TripResult(
            provider=self.provider,
            trip_id=trip_id,
            status=str(trip.get("status", "processing")),
            driver_name=driver.get("name"),
            vehicle_description=_vehicle_text(vehicle),
            eta_minutes=trip.get("pickup_eta_minutes"),
        )

    async def cancel(self, trip_id: str) -> None:
        response = await self._client.delete(
            f"{self.base_url}/trips/{trip_id}",
            headers=self._headers(),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if response.status_code >= 400 and response.status_code != 404:
            raise ProviderRejected(self.provider, _reason(response))


class LyftHealthcareAdapter:
    """Lyft Concierge API.

    Concierge books on the patient's behalf in a single call. Lyft texts the
    patient the driver details, so again no rider app is required.
    """

    provider = ProviderId.LYFT_HEALTHCARE
    base_url = "https://api.lyft.com/v1"

    def __init__(self, client: httpx.AsyncClient, access_token: str | None) -> None:
        self._client = client
        self._access_token = access_token

    @property
    def configured(self) -> bool:
        return bool(self._access_token)

    def _headers(self) -> dict[str, str]:
        if not self._access_token:
            raise ProviderNotConfigured("Lyft Concierge access token is not set")
        return {
            "Authorization": f"Bearer {self._access_token}",
            "Content-Type": "application/json",
        }

    def _body(self, request: TripRequest) -> dict[str, object]:
        body: dict[str, object] = {
            "ride_type": "access" if request.wheelchair_accessible else "lyft",
            "origin": _lyft_place(request.pickup),
            "destination": _lyft_place(request.dropoff),
            "passenger": {
                "phone_number": request.patient_phone,
                "first_name": request.patient_name.split(" ")[0],
                "last_name": " ".join(request.patient_name.split(" ")[1:]) or "-",
            },
        }
        if request.pickup_at:
            body["scheduled_at"] = request.pickup_at
        return body

    async def estimate(self, request: TripRequest) -> TripEstimate:
        response = await self._client.post(
            f"{self.base_url}/cost",
            headers=self._headers(),
            json=self._body(request),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if response.status_code >= 400:
            raise ProviderRejected(self.provider, _reason(response))
        estimates = response.json().get("cost_estimates") or []
        if not estimates:
            raise ProviderRejected(self.provider, "No Lyft coverage for this route")
        first = estimates[0]
        return TripEstimate(
            provider=self.provider,
            fare_cents=int(first.get("estimated_cost_cents_max", 0)),
            currency=str(first.get("currency", "USD")),
            eta_minutes=int(first.get("estimated_duration_seconds", 0)) // 60,
        )

    async def dispatch(self, request: TripRequest) -> TripResult:
        response = await self._client.post(
            f"{self.base_url}/rides",
            headers=self._headers(),
            json=self._body(request),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if response.status_code >= 400:
            raise ProviderRejected(self.provider, _reason(response))
        ride = response.json()
        driver = ride.get("driver") or {}
        vehicle = ride.get("vehicle") or {}
        return TripResult(
            provider=self.provider,
            trip_id=str(ride["ride_id"]),
            status=str(ride.get("status", "pending")),
            driver_name=driver.get("first_name"),
            vehicle_description=_vehicle_text(vehicle),
            eta_minutes=ride.get("pickup_eta_minutes"),
        )

    async def cancel(self, trip_id: str) -> None:
        response = await self._client.post(
            f"{self.base_url}/rides/{trip_id}/cancel",
            headers=self._headers(),
            json={},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if response.status_code >= 400 and response.status_code != 404:
            raise ProviderRejected(self.provider, _reason(response))


def _lyft_place(place: Place) -> dict[str, object]:
    payload: dict[str, object] = {"address": place.address}
    if place.latitude is not None and place.longitude is not None:
        payload["lat"] = place.latitude
        payload["lng"] = place.longitude
    return payload


def _vehicle_text(vehicle: dict[str, object]) -> str | None:
    parts = [
        str(vehicle.get(key))
        for key in ("color", "make", "model")
        if vehicle.get(key)
    ]
    plate = vehicle.get("license_plate")
    text = " ".join(parts)
    if plate:
        text = f"{text} · {plate}".strip(" ·")
    return text or None


def _reason(response: httpx.Response) -> str:
    """The provider's own words, so a navigator sees why the trip failed."""
    try:
        payload = response.json()
    except ValueError:
        return f"HTTP {response.status_code}"
    for key in ("message", "error_description", "error", "detail"):
        value = payload.get(key)
        if isinstance(value, str) and value:
            return value
    return f"HTTP {response.status_code}"


async def dispatch_with_fallback(
    adapters: dict[ProviderId, TransportAdapter],
    request: TripRequest,
    order: tuple[ProviderId, ...] = FALLBACK_ORDER,
) -> tuple[TripResult, list[tuple[ProviderId, str]]]:
    """Try each provider in turn until one accepts.

    Returns the successful trip plus the providers that declined and why, so
    the audit timeline can record the whole chain rather than only the winner.
    A stretcher trip skips rideshare entirely, since neither Uber nor Lyft
    will carry one and asking wastes the window.
    """
    failures: list[tuple[ProviderId, str]] = []

    for provider_id in order:
        if request.stretcher and provider_id is not ProviderId.CARELINK_NEMT:
            continue
        adapter = adapters.get(provider_id)
        if adapter is None or not adapter.configured:
            failures.append((provider_id, "Not configured for this program"))
            continue
        try:
            return await adapter.dispatch(request), failures
        except (ProviderRejected, httpx.HTTPError) as error:
            reason = error.reason if isinstance(error, ProviderRejected) else str(error)
            failures.append((provider_id, reason))

    raise ProviderRejected(
        order[-1],
        "Every contracted provider declined this trip: "
        + "; ".join(f"{pid.value} ({reason})" for pid, reason in failures),
    )
