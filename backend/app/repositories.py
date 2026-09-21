from __future__ import annotations

from fastapi import Depends
from sqlalchemy import func, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.constants import (
    FOUNDATION_KEY,
    FOUNDATION_SEED_VALUE,
    FOUNDATION_SEED_VERSION,
)
from app.database import get_session
from app.models import FoundationProofRecord


class FoundationProofRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self) -> FoundationProofRecord | None:
        return self.session.get(FoundationProofRecord, FOUNDATION_KEY)

    def put(self, value: str) -> FoundationProofRecord:
        statement = insert(FoundationProofRecord).values(
            key=FOUNDATION_KEY,
            value=value,
            seed_version=FOUNDATION_SEED_VERSION,
        )
        statement = statement.on_conflict_do_update(
            index_elements=[FoundationProofRecord.key],
            set_={"value": value, "updated_at": func.now()},
        ).returning(FoundationProofRecord)
        proof = self.session.execute(statement).scalar_one()
        self.session.commit()
        return proof

    def reset(self) -> FoundationProofRecord:
        statement = insert(FoundationProofRecord).values(
            key=FOUNDATION_KEY,
            value=FOUNDATION_SEED_VALUE,
            seed_version=FOUNDATION_SEED_VERSION,
        )
        statement = statement.on_conflict_do_update(
            index_elements=[FoundationProofRecord.key],
            set_={
                "value": FOUNDATION_SEED_VALUE,
                "seed_version": FOUNDATION_SEED_VERSION,
                "updated_at": func.now(),
            },
            where=or_(
                FoundationProofRecord.value != FOUNDATION_SEED_VALUE,
                FoundationProofRecord.seed_version != FOUNDATION_SEED_VERSION,
            ),
        ).returning(FoundationProofRecord)
        proof = self.session.execute(statement).scalar_one_or_none()
        if proof is None:
            proof = self.session.execute(
                select(FoundationProofRecord).where(
                    FoundationProofRecord.key == FOUNDATION_KEY
                )
            ).scalar_one()
        self.session.commit()
        return proof


def get_proof_repository(
    session: Session = Depends(get_session),
) -> FoundationProofRepository:
    return FoundationProofRepository(session)

