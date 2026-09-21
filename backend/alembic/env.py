"""Alembic runtime configuration for the OncoReady PostgreSQL schema."""

from __future__ import annotations

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import Connection, make_url
from sqlalchemy.exc import ArgumentError


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Revisions are intentionally explicit instead of being generated from live models.
target_metadata = None


def _database_url() -> str:
    """Return the server-only migration URL without placing it in source control."""
    url = os.getenv("DATABASE_URL", "").strip()
    if not url:
        raise RuntimeError("DATABASE_URL is required to run Alembic migrations")

    # Some managed PostgreSQL providers still emit the historical alias, which
    # modern SQLAlchemy does not recognize as a dialect name.
    if url.startswith("postgres://"):
        url = f"postgresql://{url.removeprefix('postgres://')}"

    try:
        backend_name = make_url(url).get_backend_name()
    except ArgumentError:
        # Do not include the supplied value: it may contain database credentials.
        raise RuntimeError("DATABASE_URL must be a valid PostgreSQL URL") from None
    if backend_name != "postgresql":
        raise RuntimeError("DATABASE_URL must use PostgreSQL")

    return url


def _configure(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        transaction_per_migration=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_offline() -> None:
    """Render migration SQL without opening a database connection."""
    context.configure(
        url=_database_url(),
        target_metadata=target_metadata,
        compare_type=True,
        dialect_opts={"paramstyle": "named"},
        literal_binds=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Apply migrations using an injected test connection or DATABASE_URL."""
    supplied_connection = config.attributes.get("connection")
    if supplied_connection is not None:
        _configure(supplied_connection)
        return

    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = _database_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        _configure(connection)


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
