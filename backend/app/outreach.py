"""Bounded, operator-only live outreach. No browser-supplied recipient or content."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.config import Settings
from app.database import get_session
from app.models import OutreachArmRecord, OutreachAttemptRecord
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


def _settings(request: Request) -> Settings:
    return request.app.state.settings


def _available(settings: Settings) -> None:
    if not settings.outreach_ready:
        raise ApiError(503, "outreach_unavailable", "Live outreach is unavailable.")


def _arm(session: Session) -> OutreachArmRecord | None:
    return session.get(OutreachArmRecord, "demo")


def _summary(session: Session, settings: Settings) -> dict:
    arm = _arm(session)
    attempts = {a.kind: a for a in session.execute(select(OutreachAttemptRecord)).scalars()}
    now = datetime.now(timezone.utc)
    return {
        "available": settings.outreach_ready,
        "armed": bool(arm and arm.expires_at > now),
        "expires_at": arm.expires_at.isoformat() if arm else None,
        "sms": attempts.get("sms").status if "sms" in attempts else "not_started",
        "call": attempts.get("call").status if "call" in attempts else "not_started",
        "call_completed": attempts.get("call").status == "completed" if "call" in attempts else False,
    }


def _refresh(session: Session, settings: Settings) -> None:
    attempts = session.execute(select(OutreachAttemptRecord)).scalars().all()
    for attempt in attempts:
        if not attempt.provider_sid or attempt.status in {"delivered", "completed", "failed", "undelivered"}:
            continue
        path = "Messages" if attempt.kind == "sms" else "Calls"
        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/{path}/{attempt.provider_sid}.json"
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
        allowed = (
            {"queued", "sending", "sent", "delivered", "undelivered", "failed"}
            if attempt.kind == "sms"
            else {"queued", "initiated", "ringing", "in-progress", "completed", "busy", "failed", "no-answer", "canceled"}
        )
        if raw_status in allowed:
            attempt.status = "in_progress" if raw_status == "in-progress" else raw_status.replace("-", "_")
            attempt.updated_at = datetime.now(timezone.utc)
    session.commit()


@router.get("/status")
def status(request: Request, session: Session = Depends(get_session)) -> dict:
    settings = _settings(request)
    if settings.outreach_ready:
        _refresh(session, settings)
    return _summary(session, settings)


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
    attempt = _reserve(session, "call")
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
    return _summary(session, settings)
