"""Message model for chat messages within conversations."""

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Message(Base):
    """Individual chat message model.

    Attributes:
        id: Unique identifier (UUID).
        conversation_id: Parent conversation ID.
        role: Message sender role ('user' or 'assistant').
        content: Message text content.
        sources: JSON array of source references (for assistant messages).
        confidence: Confidence score for assistant responses (0.0 to 1.0).
        created_at: Message timestamp.
    """

    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sources: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, nullable=True, default=None
    )
    confidence: Mapped[float | None] = mapped_column(
        Float, nullable=True, default=None
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )

    def __repr__(self) -> str:
        return f"<Message(id={self.id}, role={self.role})>"
