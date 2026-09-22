"""Persist one bounded outreach arm and each one-shot delivery reservation."""

from alembic import op
import sqlalchemy as sa

revision = "20260922_0002"
down_revision = "20260921_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "outreach_arms",
        sa.Column("key", sa.String(32), primary_key=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "outreach_attempts",
        sa.Column("kind", sa.String(8), primary_key=True),
        sa.Column("status", sa.String(24), nullable=False),
        sa.Column("provider_sid", sa.String(64)),
        sa.Column("conversation_id", sa.String(64)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("kind IN ('sms', 'call')", name="ck_outreach_kind"),
    )


def downgrade() -> None:
    op.drop_table("outreach_attempts")
    op.drop_table("outreach_arms")
