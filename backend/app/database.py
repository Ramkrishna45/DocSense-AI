"""Async SQLAlchemy database setup with pgvector support.

Provides engine, session factory, Base class, and initialization utilities.
"""

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Create async engine with connection pool settings
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0
    },
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


async def init_db() -> None:
    """Initialize the database: enable pgvector extension and create all tables.

    Should be called once at application startup.
    """
    async with engine.begin() as conn:
        # Enable pgvector extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        # Drop chunks table to allow dimension migration
        await conn.execute(text("DROP TABLE IF EXISTS chunks CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS document_chunks CASCADE"))
        # Create all tables from registered models
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides an async database session.

    Yields:
        AsyncSession: An async SQLAlchemy session that auto-closes after use.
    """
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
