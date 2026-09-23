"""Bounded, operator-only live outreach. No browser-supplied recipient or content."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.config import Settings
from app.database import get_session
from app.models import (
    OutreachArmRecord,
    OutreachAttemptRecord,
    OutreachCallAttemptRecord,
    OutreachCallWindowRecord,
)
from app.security import require_operator
from app.web import ApiError


SMS_TEXT = (
    "OncoReady: Is your transportation plan ready for your upcoming appointment? "
    "Open your workspace to confirm your plan or request help. Reply STOP to stop text outreach."
)

router = APIRouter(
    prefix="/api/v1/operator/outreach",
    tags=["Operator"],
    dependencies=[Depends(require_operator)],
)

CALL_FINAL_STATUSES = frozenset({"completed", "busy", "failed", "no_answer", "canceled"})
CALL_PROVIDER_STATUSES = frozenset({
    "queued", "initiated", "ringing", "in-progress", "completed", "busy",
    "failed", "no-answer", "canceled",
})
# Serialize authorization across API instances and operator devices.
CALL_LOCK_ID = 2026092301


class CallArmRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purpose: Literal["test", "demo"]
    consent_confirmed: Literal[True]


def _settings(request: Request) -> Settings:
    return request.app.state.settings


def _available(settings: Settings) -> None:
    if not settings.outreach_ready:
        raise ApiError(503, "outreach_unavailable", "Live outreach is unavailable.")


def _arm(session: Session) -> OutreachArmRecord | None:
    return session.get(OutreachArmRecord, "demo")


def _latest_call(session: Session) -> OutreachCallAttemptRecord | None:
    return session.execute(
        select(OutreachCallAttemptRecord).order_by(OutreachCallAttemptRecord.id.desc()).limit(1)
    ).scalar_one_or_none()


def _latest_call_window(session: Session) -> OutreachCallWindowRecord | None:
    return session.execute(
        select(OutreachCallWindowRecord).order_by(OutreachCallWindowRecord.id.desc()).limit(1)
    ).scalar_one_or_none()


def _call_count_today(session: Session) -> int:
    now = datetime.now(timezone.utc)
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return session.scalar(
        select(func.count()).select_from(OutreachCallAttemptRecord).where(
            OutreachCallAttemptRecord.created_at >= midnight
        )
    ) or 0


def _call_lock(session: Session) -> None:
    session.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": CALL_LOCK_ID})


def _call_window_ready(
    session: Session, window: OutreachCallWindowRecord | None, now: datetime
) -> bool:
    if window is None or window.expires_at <= now:
        return False
    used = session.scalar(
        select(OutreachCallAttemptRecord.id).where(
            OutreachCallAttemptRecord.window_id == window.id
        ).limit(1)
    )
    return used is None


def _summary(session: Session, settings: Settings) -> dict:
    arm = _arm(session)
    sms = session.get(OutreachAttemptRecord, "sms")
    call = _latest_call(session)
    call_window = _latest_call_window(session)
    call_purpose = (
        session.get(OutreachCallWindowRecord, call.window_id).purpose
        if call is not None and call.window_id is not None else None
    )
    now = datetime.now(timezone.utc)
    call_armed = _call_window_ready(session, call_window, now)
    call_finished = call is None or call.status in CALL_FINAL_STATUSES
    call_limit_reached = _call_count_today(session) >= settings.outreach_daily_call_limit
    return {
        "available": settings.outreach_ready,
        "armed": bool(arm and arm.expires_at > now),
        "expires_at": arm.expires_at.isoformat() if arm else None,
        "sms": sms.status if sms else "not_started",
        "call": call.status if call else "not_started",
        "call_completed": call.status == "completed" if call else False,
        "call_purpose": call_purpose,
        "call_armed": call_armed,
        "call_can_arm": bool(
            settings.outreach_ready and not call_armed and call_finished and not call_limit_reached
        ),
        "call_expires_at": call_window.expires_at.isoformat() if call_armed else None,
        "call_attempts_today": _call_count_today(session),
        "call_daily_limit": settings.outreach_daily_call_limit,
    }


def _refresh(session: Session, settings: Settings) -> None:
    attempts = session.execute(
        select(OutreachAttemptRecord).where(OutreachAttemptRecord.kind == "sms")
    ).scalars().all()
    for attempt in attempts:
        if not attempt.provider_sid or attempt.status in {"delivered", "completed", "failed", "undelivered"}:
            continue
        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages/{attempt.provider_sid}.json"
        try:
            response = httpx.get(
                url,
                auth=(settings.twilio_account_sid or "", settings.twilio_auth_token.get_secret_value()),
                timeout=7,
            )
            response.raise_for_status()
            raw_status = response.json().get("status", "")
        except (httpx.HTTPError, ValueError):
            continue
        if raw_status in {"queued", "sending", "sent", "delivered", "undelivered", "failed"}:
            attempt.status = raw_status
            attempt.updated_at = datetime.now(timezone.utc)
    session.commit()


def _refresh_call(session: Session, settings: Settings, *, commit: bool = True) -> None:
    call = _latest_call(session)
    if call is None or call.status in CALL_FINAL_STATUSES or not call.provider_sid:
        return
    try:
        response = httpx.get(
            f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Calls/{call.provider_sid}.json",
            auth=(settings.twilio_account_sid or "", settings.twilio_auth_token.get_secret_value()),
            timeout=7,
        )
        response.raise_for_status()
        raw_status = response.json().get("status", "")
    except (httpx.HTTPError, ValueError):
        return
    if raw_status in CALL_PROVIDER_STATUSES:
        call.status = raw_status.replace("-", "_")
        call.updated_at = datetime.now(timezone.utc)
        if commit:
            session.commit()


@router.get("/status")
def status(request: Request, session: Session = Depends(get_session)) -> dict:
    settings = _settings(request)
    if settings.outreach_ready:
        _refresh(session, settings)
        _refresh_call(session, settings)
    return _summary(session, settings)


@router.post("/call/arm")
def arm_call(request: Request, body: CallArmRequest, session: Session = Depends(get_session)) -> dict:
    settings = _settings(request)
    _available(settings)
    _call_lock(session)
    _refresh_call(session, settings, commit=False)
    now = datetime.now(timezone.utc)
    if _call_window_ready(session, _latest_call_window(session), now):
        raise ApiError(409, "already_armed", "A call window is already open.")
    latest = _latest_call(session)
    if latest is not None and latest.status not in CALL_FINAL_STATUSES:
        raise ApiError(409, "call_unresolved", "The previous call has not reached a confirmed final status.")
    if _call_count_today(session) >= settings.outreach_daily_call_limit:
        raise ApiError(409, "call_limit_reached", "Today's call limit has been reached.")
    session.add(OutreachCallWindowRecord(
        purpose=body.purpose,
        consent_confirmed_at=now,
        expires_at=now + timedelta(minutes=settings.outreach_arm_minutes),
    ))
    session.commit()
    return _summary(session, settings)


def _reserve_call(session: Session, settings: Settings) -> OutreachCallAttemptRecord:
    _call_lock(session)
    _refresh_call(session, settings, commit=False)
    window = _latest_call_window(session)
    if not _call_window_ready(session, window, datetime.now(timezone.utc)):
        raise ApiError(403, "not_armed", "No unused call window is open.")
    latest = _latest_call(session)
    if latest is not None and latest.status not in CALL_FINAL_STATUSES:
        raise ApiError(409, "call_unresolved", "The previous call has not reached a confirmed final status.")
    if _call_count_today(session) >= settings.outreach_daily_call_limit:
        raise ApiError(409, "call_limit_reached", "Today's call limit has been reached.")
    attempt = OutreachCallAttemptRecord(window_id=window.id, status="initiating")
    session.add(attempt)
    session.commit()  # Reserve durably before the ElevenLabs request.
    session.refresh(attempt)
    return attempt


@router.post("/arm")
def arm(request: Request, session: Session = Depends(get_session)) -> dict:
    settings = _settings(request)
    _available(settings)
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.outreach_arm_minutes)
    statement = insert(OutreachArmRecord).values(key="demo", expires_at=expires).on_conflict_do_nothing().returning(OutreachArmRecord.key)
    inserted = session.execute(statement).scalar_one_or_none()
    session.commit()
    if inserted is None:
        raise ApiError(409, "already_armed", "The one-time outreach window has already been armed.")
    return _summary(session, settings)


def _reserve(session: Session, kind: str) -> OutreachAttemptRecord:
    arm_record = _arm(session)
    if arm_record is None or arm_record.expires_at <= datetime.now(timezone.utc):
        raise ApiError(403, "not_armed", "The outreach window is not armed or has expired.")
    statement = insert(OutreachAttemptRecord).values(kind=kind, status="initiating").on_conflict_do_nothing().returning(OutreachAttemptRecord.kind)
    inserted = session.execute(statement).scalar_one_or_none()
    session.commit()  # Durable before any provider request, including a timed-out request.
    if inserted is None:
        raise ApiError(409, "already_attempted", "This action has already been attempted.")
    return session.get(OutreachAttemptRecord, kind)


@router.post("/sms")
def send_sms(request: Request, session: Session = Depends(get_session)) -> dict:
    settings = _settings(request)
    _available(settings)
    attempt = _reserve(session, "sms")
    try:
        response = httpx.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json",
            auth=(settings.twilio_account_sid or "", settings.twilio_auth_token.get_secret_value()),
            data={"To": settings.outreach_recipient, "From": settings.twilio_from_number, "Body": SMS_TEXT},
            timeout=10,
        )
        response.raise_for_status()
        sid = response.json().get("sid")
        if not isinstance(sid, str) or not sid.startswith("SM"):
            raise ValueError("Missing provider message identity")
        attempt.provider_sid = sid
        attempt.status = "submitted"
    except httpx.HTTPStatusError as error:
        attempt.status = "failed" if 400 <= error.response.status_code < 500 else "unknown"
    except (httpx.HTTPError, ValueError):
        attempt.status = "unknown"
    attempt.updated_at = datetime.now(timezone.utc)
    session.commit()
    return _summary(session, settings)


@router.post("/call")
def place_call(request: Request, session: Session = Depends(get_session)) -> dict:
    settings = _settings(request)
    _available(settings)
    attempt = _reserve_call(session, settings)
    _dial(session, settings, attempt)
    return _summary(session, settings)


def _dial(session: Session, settings: Settings, attempt: OutreachCallAttemptRecord) -> None:
    """Ask the voice agent to call the fixed server-side recipient for a reserved attempt."""
    try:
        response = httpx.post(
            "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
            headers={"xi-api-key": settings.elevenlabs_api_key.get_secret_value()},
            json={
                "agent_id": settings.elevenlabs_agent_id,
                "agent_phone_number_id": settings.elevenlabs_phone_number_id,
                "to_number": settings.outreach_recipient,
                "call_recording_enabled": False,
            },
            timeout=12,
        )
        response.raise_for_status()
        payload = response.json()
        sid = payload.get("callSid")
        if payload.get("success") is not True or not isinstance(sid, str) or not sid.startswith("CA"):
            raise ValueError("Missing provider call identity")
        attempt.provider_sid = sid
        attempt.conversation_id = payload.get("conversation_id")
        attempt.status = "initiating"
    except httpx.HTTPStatusError as error:
        attempt.status = "failed" if 400 <= error.response.status_code < 500 else "unknown"
    except (httpx.HTTPError, ValueError):
        attempt.status = "unknown"
    attempt.updated_at = datetime.now(timezone.utc)
    session.commit()


# In-app demo calling. No operator token: the DEMO_CALL_BUTTON switch, the fixed recipient,
# one unresolved call at a time and the daily limit are the guards. Nothing about the
# recipient or provider is returned to the browser.
demo_router = APIRouter(prefix="/api/v1/outreach/demo-call", tags=["Outreach"])


def _demo_enabled(settings: Settings) -> bool:
    return bool(settings.demo_call_button and settings.outreach_ready)


def _demo_summary(session: Session | None, settings: Settings) -> dict:
    if session is None or not _demo_enabled(settings):
        return {"enabled": False, "call": "not_started", "in_progress": False, "calls_today": 0, "daily_limit": settings.outreach_daily_call_limit}
    call = _latest_call(session)
    calls_today = _call_count_today(session)
    return {
        "enabled": calls_today < settings.outreach_daily_call_limit,
        "call": call.status if call else "not_started",
        "in_progress": bool(call and call.status not in CALL_FINAL_STATUSES),
        "calls_today": calls_today,
        "daily_limit": settings.outreach_daily_call_limit,
    }


def _demo_session(request: Request):
    # Opened only after the switch check, so a disabled button never touches the database.
    return request.app.state.database.session()


@demo_router.get("")
def demo_call_status(request: Request) -> dict:
    settings = _settings(request)
    if not _demo_enabled(settings):
        return _demo_summary(None, settings)
    with _demo_session(request) as session:
        _refresh_call(session, settings)
        return _demo_summary(session, settings)


@demo_router.post("")
def place_demo_call(request: Request) -> dict:
    settings = _settings(request)
    if not settings.demo_call_button:
        raise ApiError(403, "demo_call_off", "Calling is off.")
    _available(settings)
    with _demo_session(request) as session:
        return _place_demo_call(session, settings)


def _place_demo_call(session: Session, settings: Settings) -> dict:
    _call_lock(session)
    _refresh_call(session, settings, commit=False)
    latest = _latest_call(session)
    if latest is not None and latest.status not in CALL_FINAL_STATUSES:
        raise ApiError(409, "call_unresolved", "A call is already in progress.")
    if _call_count_today(session) >= settings.outreach_daily_call_limit:
        raise ApiError(409, "call_limit_reached", "Today's call limit has been reached.")
    now = datetime.now(timezone.utc)
    # Standing consent comes from OUTREACH_CONSENT_CONFIRMED; switching the demo button on is the day's authorization.
    window = OutreachCallWindowRecord(purpose="demo", consent_confirmed_at=now, expires_at=now + timedelta(minutes=settings.outreach_arm_minutes))
    session.add(window)
    session.flush()
    attempt = OutreachCallAttemptRecord(window_id=window.id, status="initiating")
    session.add(attempt)
    session.commit()  # Reserve durably before the provider request.
    session.refresh(attempt)
    _dial(session, settings, attempt)
    return _demo_summary(session, settings)
