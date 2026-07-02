"""Pydantic schemas for chat and conversation endpoints."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Schema for chat message request."""

    message: str = Field(..., min_length=1, max_length=5000, description="User's question")
    conversation_id: uuid.UUID | None = Field(
        None, description="Existing conversation ID, or None to create a new one"
    )
    search_mode: str = Field("semantic", description="Search mode to use")
    collection_id: uuid.UUID | None = Field(None, description="Optional collection ID")
    document_ids: list[uuid.UUID] | None = Field(None, description="Optional list of document IDs to filter by")


class SourceInfo(BaseModel):
    """Schema for a source reference in chat responses."""

    document_title: str
    page_number: int | None = None
    chunk_number: int
    excerpt: str


class ChatResponse(BaseModel):
    """Schema for chat AI response."""

    message: str
    sources: list[SourceInfo]
    confidence: float | None = None
    conversation_id: uuid.UUID


class ConversationResponse(BaseModel):
    """Schema for conversation list item."""

    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    """Schema for individual message in conversation history."""

    id: uuid.UUID
    role: str
    content: str
    sources: Any | None = None
    confidence: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
