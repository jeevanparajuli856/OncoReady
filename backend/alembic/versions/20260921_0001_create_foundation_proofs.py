"""Create the bounded foundation persistence proof table.

Forward creates only ``foundation_proofs`` and contains no seed DML. Rollback
drops that table, including its rows, constraints, and primary-key index.

Revision ID: 20260921_0001
Revises: None
Create Date: 2026-09-21 00:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260921_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "foundation_proofs",
        sa.Column("key", sa.String(length=64), nullable=False),
        sa.Column("value", sa.String(length=256), nullable=False),
        sa.Column("seed_version", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "char_length(key) BETWEEN 1 AND 64",
            name="ck_foundation_proofs_key_length",
        ),
        sa.CheckConstraint(
            "char_length(value) BETWEEN 1 AND 256",
            name="ck_foundation_proofs_value_length",
        ),
        sa.CheckConstraint(
            "seed_version >= 1",
            name="ck_foundation_proofs_seed_version_positive",
        ),
        sa.PrimaryKeyConstraint("key", name="pk_foundation_proofs"),
    )


def downgrade() -> None:
    op.drop_table("foundation_proofs")
