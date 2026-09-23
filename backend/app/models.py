from __future__ import annotations

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class FoundationProofRecord(Base):
    __tablename__ = "foundation_proofs"
    __table_args__ = (
        CheckConstraint("char_length(value) > 0", name="ck_foundation_proofs_value_nonempty"),
        CheckConstraint("seed_version >= 1", name="ck_foundation_proofs_seed_version_positive"),
    )

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(String(256), nullable=False)
    seed_version: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class OutreachArmRecord(Base):
    __tablename__ = "outreach_arms"
    key: Mapped[str] = mapped_column(String(32), primary_key=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class OutreachAttemptRecord(Base):
    __tablename__ = "outreach_attempts"
    kind: Mapped[str] = mapped_column(String(8), primary_key=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    provider_sid: Mapped[str | None] = mapped_column(String(64))
    conversation_id: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class OutreachCallWindowRecord(Base):
    __tablename__ = "outreach_call_windows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    purpose: Mapped[str] = mapped_column(String(8), nullable=False)
    consent_confirmed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class OutreachCallAttemptRecord(Base):
    __tablename__ = "outreach_call_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    window_id: Mapped[int | None] = mapped_column(
        ForeignKey("outreach_call_windows.id"), unique=True
    )
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    provider_sid: Mapped[str | None] = mapped_column(String(64))
    conversation_id: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
