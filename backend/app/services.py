from __future__ import annotations

import logging
from collections.abc import Callable
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory
from fastapi import Request

from app.config import Settings
from app.database import Database


logger = logging.getLogger("oncoready.readiness")


def code_heads() -> list[str]:
    backend_dir = Path(__file__).resolve().parents[1]
    config = Config(str(backend_dir / "alembic" / "alembic.ini"))
    config.set_main_option("script_location", str(backend_dir / "alembic"))
    return list(ScriptDirectory.from_config(config).get_heads())


class ReadinessService:
    def __init__(
        self,
        *,
        database: Database,
        settings: Settings,
        code_heads: Callable[[], list[str]] = code_heads,
    ) -> None:
        self.database = database
        self.settings = settings
        self.code_heads = code_heads

    def check(self) -> dict[str, str]:
        configuration_issues = list(self.settings.missing_required_settings)
        if self.database.configuration_error:
            configuration_issues.append(self.database.configuration_error)
        if configuration_issues:
            logger.warning(
                "required configuration is unavailable",
                extra={
                    "event": "readiness_configuration_unavailable",
                    "setting_names": sorted(set(configuration_issues)),
                },
            )
            return self._unavailable(database="unavailable", migration="unavailable")

        try:
            applied_revisions = self.database.applied_revisions()
        except Exception as error:
            logger.warning(
                "database readiness check failed",
                extra={
                    "event": "readiness_database_unavailable",
                    "error_type": type(error).__name__,
                },
            )
            return self._unavailable(database="unavailable", migration="unavailable")

        try:
            expected_heads = self.code_heads()
        except Exception as error:
            logger.error(
                "migration metadata is unavailable",
                extra={
                    "event": "readiness_migration_unavailable",
                    "error_type": type(error).__name__,
                },
            )
            return self._unavailable(database="ready", migration="unavailable")

        if len(expected_heads) != 1:
            logger.error(
                "migration metadata must contain one code head",
                extra={
                    "event": "readiness_migration_unavailable",
                    "head_count": len(expected_heads),
                },
            )
            return self._unavailable(database="ready", migration="unavailable")
        if applied_revisions != expected_heads:
            logger.warning(
                "database migration revision does not match code head",
                extra={
                    "event": "readiness_migration_mismatch",
                    "applied_head_count": len(applied_revisions),
                },
            )
            return self._unavailable(database="ready", migration="mismatch")
        return {"status": "ready", "database": "ready", "migration": "current"}

    @staticmethod
    def _unavailable(*, database: str, migration: str) -> dict[str, str]:
        return {
            "status": "unavailable",
            "database": database,
            "migration": migration,
        }


def get_readiness_service(request: Request) -> ReadinessService:
    return ReadinessService(
        database=request.app.state.database,
        settings=request.app.state.settings,
    )
