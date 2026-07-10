"""Pydantic schemas for semantic search endpoints."""

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Schema for semantic search request."""

    query: str = Field(..., min_length=1, max_length=2000, description="Search query text")
    limit: int = Field(5, ge=1, le=20, description="Maximum number of results to return")
    search_mode: str = Field("semantic", description="semantic, keyword, or hybrid")
    collection_id: str | None = None


class SearchResult(BaseModel):
    """Schema for individual search result."""

    document_id: str
    document_title: str
    original_filename: str | None = None
    page_number: int | None = None
    chunk_number: int
    content: str
    similarity_score: float
    match_type: str = "semantic"


class SearchResponse(BaseModel):
    """Schema for search results response."""

    results: list[SearchResult]
    query: str
