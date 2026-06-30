"""Document service for file upload, processing, and management."""

import logging
import os
import uuid
import json
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.chunk import Chunk
from app.models.document import Document
from app.models.collection import Collection, document_collections
from app.services.embedding_service import embedding_service
from app.utils.file_processor import process_source
from app.utils.text_chunker import chunk_text
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "md"}

def _get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower().strip(".")

async def generate_document_summary(text: str) -> dict:
    """Generate a summary, key topics, and keywords using Gemini."""
    try:
        # Use only first 10000 characters for summary to save tokens
        text_to_summarize = text[:10000]
        
        llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2
        )
        
        prompt = f"""
        Analyze the following text and provide a JSON response with a summary, key topics, and keywords.
        Format MUST be valid JSON like this:
        {{
            "summary": "A 2-3 sentence summary of the text.",
            "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
            "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
        }}
        
        Text to analyze:
        {text_to_summarize}
        """
        
        response = llm.invoke(prompt)
        response_text = response.content.replace("```json", "").replace("```", "").strip()
        
        return json.loads(response_text)
    except Exception as e:
        logger.error(f"Failed to generate summary: {e}")
        return {"summary": None, "key_topics": None, "keywords": None}

async def upload_document(
    db: AsyncSession,
    user_id: uuid.UUID,
    file: UploadFile = None,
    source_url: str = None,
    source_type: str = "file",
    title: str = None
) -> Document:
    """Upload a file or register a URL source."""
    if source_type == "file":
        if not file or not file.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Filename is required")

        file_ext = _get_file_extension(file.filename)
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: '.{file_ext}'"
            )

        content = await file.read()
        file_size = len(content)

        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")

        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        stored_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = upload_dir / stored_filename

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        doc_title = title or Path(file.filename).stem
        document = Document(
            user_id=user_id,
            title=doc_title,
            filename=stored_filename,
            original_filename=file.filename,
            size=file_size,
            status="pending",
            source_type="file"
        )
    else:
        # Non-file source (URL, YouTube, GitHub)
        if not source_url:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Source URL is required")
            
        doc_title = title or source_url.split("/")[-1] or source_url
        document = Document(
            user_id=user_id,
            title=doc_title,
            filename=source_url, # store URL here for now
            original_filename=source_url,
            size=0,
            status="pending",
            source_type=source_type,
            source_url=source_url
        )

    db.add(document)
    await db.flush()
    await db.refresh(document)
    return document

async def process_document(
    db: AsyncSession,
    document_id: uuid.UUID,
    source: str,
    source_type: str,
    original_filename: str = ""
) -> None:
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        return

    try:
        document.status = "processing"
        await db.flush()

        # 1. Extract Text
        pages = process_source(source, source_type, original_filename)
        
        if not pages:
            document.status = "completed"
            await db.flush()
            return

        # 2. Generate Summary
        full_text = " ".join([p[1] for p in pages])
        # simple reading time estimate (250 words per minute)
        word_count = len(full_text.split())
        document.estimated_reading_time = max(1, word_count // 250)
        
        summary_data = await generate_document_summary(full_text)
        document.summary = summary_data.get("summary")
        document.key_topics = summary_data.get("key_topics")
        document.keywords = summary_data.get("keywords")

        # 3. Chunking
        chunks_data = chunk_text(pages)
        if not chunks_data:
            document.status = "completed"
            await db.flush()
            return

        # 4. Generate Embeddings
        chunk_texts = [c["content"] for c in chunks_data]
        embeddings = embedding_service.embed_documents(chunk_texts)

        # 5. Store Chunks
        chunk_objects = []
        for chunk_data, embedding in zip(chunks_data, embeddings):
            chunk_obj = Chunk(
                document_id=document_id,
                chunk_number=chunk_data["chunk_number"],
                page_number=chunk_data["page_number"],
                content=chunk_data["content"],
                embedding=embedding,
            )
            chunk_objects.append(chunk_obj)

        db.add_all(chunk_objects)

        document.status = "completed"
        document.chunk_count = len(chunk_objects)
        await db.flush()

    except Exception as e:
        logger.error(f"Failed to process document {document_id}: {e}", exc_info=True)
        document.status = "failed"
        await db.flush()

async def get_user_documents(db: AsyncSession, user_id: uuid.UUID) -> list[Document]:
    result = await db.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())

async def get_document(db: AsyncSession, document_id: uuid.UUID, user_id: uuid.UUID) -> Document:
    result = await db.execute(select(Document).where(Document.id == document_id, Document.user_id == user_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

async def delete_document(db: AsyncSession, document_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    document = await get_document(db, document_id, user_id)
    if document.source_type == 'file':
        file_path = Path(settings.UPLOAD_DIR) / document.filename
        if file_path.exists():
            os.remove(file_path)

    await db.execute(delete(Chunk).where(Chunk.document_id == document_id))
    await db.delete(document)
    await db.flush()
    return True

async def rename_document(db: AsyncSession, document_id: uuid.UUID, user_id: uuid.UUID, new_title: str) -> Document:
    document = await get_document(db, document_id, user_id)
    document.title = new_title
    await db.flush()
    await db.refresh(document)
    return document

async def get_user_stats(db: AsyncSession, user_id: uuid.UUID) -> dict:
    from app.models.conversation import Conversation
    from app.models.message import Message
    
    result = await db.execute(
        select(
            func.count(Document.id).label("document_count"),
            func.coalesce(func.sum(Document.size), 0).label("total_size"),
            func.coalesce(func.sum(Document.chunk_count), 0).label("total_chunks"),
        ).where(Document.user_id == user_id)
    )
    row = result.one()
    
    conv_result = await db.execute(select(func.count(Conversation.id)).where(Conversation.user_id == user_id))
    conv_count = conv_result.scalar_one()

    return {
        "document_count": row.document_count,
        "total_size": row.total_size,
        "total_chunks": row.total_chunks,
        "conversation_count": conv_count
    }
