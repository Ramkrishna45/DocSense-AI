"""Chat service for managing conversations and processing chat messages.

Orchestrates the full RAG pipeline for chat: embedding queries, searching
similar chunks, generating answers, and persisting conversation history.
"""

import logging
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.message import Message
from app.services.embedding_service import embedding_service
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)


async def create_conversation(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
) -> Conversation:
    """Create a new chat conversation.

    Args:
        db: Async database session.
        user_id: The user's UUID.
        title: Conversation title.

    Returns:
        The created Conversation object.
    """
    conversation = Conversation(
        user_id=user_id,
        title=title,
    )
    db.add(conversation)
    await db.flush()
    await db.refresh(conversation)

    logger.info("Created conversation: %s for user %s", conversation.id, user_id)
    return conversation


async def get_conversations(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> list[dict]:
    """Get all conversations for a user with message counts.

    Args:
        db: Async database session.
        user_id: The user's UUID.

    Returns:
        List of conversation dicts with message_count field.
    """
    # Query conversations with message count via subquery
    message_count_subquery = (
        select(func.count(Message.id))
        .where(Message.conversation_id == Conversation.id)
        .correlate(Conversation)
        .scalar_subquery()
    )

    result = await db.execute(
        select(
            Conversation,
            message_count_subquery.label("message_count"),
        )
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )

    conversations = []
    for conversation, message_count in result.all():
        conversations.append({
            "id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "message_count": message_count or 0,
        })

    return conversations


async def get_conversation_messages(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
) -> list[Message]:
    """Get all messages in a conversation, verifying ownership.

    Args:
        db: Async database session.
        conversation_id: The conversation's UUID.
        user_id: The requesting user's UUID.

    Returns:
        List of Message objects ordered by creation time.

    Raises:
        HTTPException: 404 if conversation not found or doesn't belong to user.
    """
    # Verify ownership
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
    )
    conversation = result.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )

    return list(result.scalars().all())


async def delete_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
) -> None:
    """Delete a conversation and all its messages.

    Args:
        db: Async database session.
        conversation_id: The conversation's UUID.
        user_id: The requesting user's UUID.

    Raises:
        HTTPException: 404 if conversation not found or doesn't belong to user.
    """
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
    )
    conversation = result.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    await db.delete(conversation)
    await db.flush()

    logger.info("Deleted conversation: %s", conversation_id)


async def add_message(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    role: str,
    content: str,
    sources: list[dict] | None = None,
    confidence: float | None = None,
) -> Message:
    """Add a message to a conversation.

    Args:
        db: Async database session.
        conversation_id: The conversation's UUID.
        role: Message role ('user' or 'assistant').
        content: Message text content.
        sources: Optional list of source references (for assistant messages).
        confidence: Optional confidence score (for assistant messages).

    Returns:
        The created Message object.
    """
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        sources=sources,
        confidence=confidence,
    )
    db.add(message)

    # Update conversation's updated_at timestamp
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()
    if conversation:
        conversation.updated_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(message)

    return message


async def process_chat(
    db: AsyncSession,
    user_id: uuid.UUID,
    message: str,
    conversation_id: uuid.UUID | None = None,
    search_mode: str = "semantic",
    collection_id: uuid.UUID | None = None,
    document_ids: list[uuid.UUID] | None = None,
) -> dict:
    """Process a chat message through the full RAG pipeline.

    Pipeline steps:
    1. Create or fetch conversation
    2. Store user message
    3. Embed the user's question
    4. Search for similar chunks in user's documents
    5. Generate answer using Gemini with context
    6. Store assistant message with sources
    7. Return response

    Args:
        db: Async database session.
        user_id: The user's UUID.
        message: The user's question text.
        conversation_id: Optional existing conversation ID.

    Returns:
        Dict with keys: message, sources, confidence, conversation_id.
    """
    # Step 1: Get or create conversation
    if conversation_id:
        # Verify ownership
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
    else:
        # Create new conversation with truncated message as title
        title = message[:100] + "..." if len(message) > 100 else message
        conversation = await create_conversation(db, user_id, title)

    # Step 2: Store user message
    await add_message(db, conversation.id, "user", message)

    # Step 3: Embed the question (only if needed by semantic/hybrid)
    query_embedding = None
    if search_mode in ["semantic", "hybrid"]:
        logger.info("Embedding query: %s...", message[:50])
        query_embedding = embedding_service.embed_query(message)

    # Step 4: Search for similar chunks
    search_results = await rag_service.search_chunks(
        db, user_id, message, query_embedding, limit=5, search_mode=search_mode, collection_id=collection_id, document_ids=document_ids
    )

    # Step 5: Generate answer
    answer_data = await rag_service.generate_answer(message, search_results)

    # Step 6: Store assistant message
    source_data = answer_data["sources"] if answer_data["sources"] else None
    await add_message(
        db,
        conversation.id,
        "assistant",
        answer_data["answer"],
        sources=source_data,
        confidence=answer_data["confidence"],
    )

    # Step 7: Build response
    sources_response = []
    for source in answer_data.get("sources", []):
        sources_response.append({
            "document_id": source.get("document_id", ""),
            "document_title": source["document_title"],
            "page_number": source.get("page_number"),
            "chunk_number": source["chunk_number"],
            "excerpt": source["excerpt"],
            "similarity_score": source.get("similarity_score", 0.0),
            "match_type": source.get("match_type", "semantic")
        })

    # Explicitly commit before returning so the frontend fetch is guaranteed to see it
    await db.commit()

    return {
        "message": answer_data["answer"],
        "sources": sources_response,
        "confidence": answer_data["confidence"],
        "conversation_id": conversation.id,
    }
