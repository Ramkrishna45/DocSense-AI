"""Chunk model for document text segments with vector embeddings."""

import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Index, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Chunk(Base):
    """Text chunk with embedding vector for similarity search.

    Attributes:
        id: Unique identifier (UUID).
        document_id: Parent document ID.
        chunk_number: Sequential chunk index within the document.
        page_number: Source page number (None for non-paginated formats).
        content: Raw text content of the chunk.
        embedding: 384-dimensional vector from all-MiniLM-L6-v2.
    """
    __tablename__ = "document_chunks_v2"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_number: Mapped[int] = mapped_column(Integer, nullable=False)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(3072), nullable=True)

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="chunks")

    # HNSW index for fast cosine similarity search
    __table_args__ = (
        Index(
            "ix_chunks_embedding_hnsw_v2",
            embedding,
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

    def __repr__(self) -> str:
        return f"<Chunk(id={self.id}, doc={self.document_id}, num={self.chunk_number})>"
