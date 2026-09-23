"""Add preserved, sequential call windows without changing the SMS ledger."""

from alembic import op
import sqlalchemy as sa

revision = "20260923_0004"
down_revision = "20260922_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "outreach_call_windows",
        sa.Column("id", sa.Integer(), sa.Identity(), primary_key=True),
        sa.Column("purpose", sa.String(8), nullable=False),
        sa.Column("consent_confirmed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "outreach_call_attempts",
        sa.Column("id", sa.Integer(), sa.Identity(), primary_key=True),
        sa.Column("window_id", sa.Integer(), sa.ForeignKey("outreach_call_windows.id"), unique=True),
        sa.Column("status", sa.String(24), nullable=False),
        sa.Column("provider_sid", sa.String(64)),
        sa.Column("conversation_id", sa.String(64)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    # Preserve the September 22 call as history. A NULL window_id cannot arm it again.
    op.execute(sa.text("""
        INSERT INTO outreach_call_attempts
            (window_id, status, provider_sid, conversation_id, created_at, updated_at)
        SELECT NULL, status, provider_sid, conversation_id, created_at, updated_at
        FROM outreach_attempts WHERE kind = 'call'
    """))


def downgrade() -> None:
    # Refuse to erase new provider evidence during rollback.
    op.execute(sa.text("""
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM outreach_call_attempts WHERE window_id IS NOT NULL) THEN
            RAISE EXCEPTION 'Cannot downgrade after a new call attempt';
          END IF;
        END $$;
    """))
    op.drop_table("outreach_call_attempts")
    op.drop_table("outreach_call_windows")
