"""Clear only reservations stranded by the pre-provider insert-result bug.

The previous route returned 409 before provider submission after committing
these rows. The one-time arm remains intact. This bounded repair is specific to
the September 22 test window and cannot clear later ambiguous submissions.
"""

from alembic import op
import sqlalchemy as sa

revision = "20260922_0003"
down_revision = "20260922_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("""
        DELETE FROM outreach_attempts
        WHERE kind IN ('sms', 'call')
          AND status = 'initiating'
          AND provider_sid IS NULL
          AND created_at >= TIMESTAMPTZ '2026-09-22 19:40:00+00'
          AND created_at < TIMESTAMPTZ '2026-09-22 19:50:00+00'
    """))


def downgrade() -> None:
    # Provider actions were never submitted for these rows; they cannot be
    # reconstructed safely after removal.
    pass
