"""Pydantic schemas for document endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    """Schema for individual document in responses."""

    id: uuid.UUID
    title: str
    original_filename: str
    size: int
    status: str
    chunk_count: int
    created_at: datetime
    
    source_type: str = "file"
    source_url: str | None = None
    summary: str | None = None
    key_topics: list[str] | None = None
    keywords: list[str] | None = None
    estimated_reading_time: int | None = None

    model_config = {"from_attributes": True}


class DocumentRename(BaseModel):
    """Schema for document rename request."""

    title: str = Field(..., min_length=1, max_length=500, description="New document title")


class DocumentListResponse(BaseModel):
    """Schema for paginated document list response."""

    documents: list[DocumentResponse]
    total: int
