import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert

from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.capture import WebpageCaptureRequest, SelectionCaptureRequest
from app.schemas.document import DocumentResponse
from app.models.document import Document
from app.models.collection import document_collections
from app.services import document_service
from app.config import settings

router = APIRouter(prefix="/api/documents/capture", tags=["capture"])

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def capture_webpage(
    request: WebpageCaptureRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = current_user.id
        
        # Save content to file
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_id = uuid.uuid4()
        stored_filename = f"{file_id}.txt"
        file_path = upload_dir / stored_filename
        
        async with aiofiles.open(file_path, "w", encoding="utf-8") as f:
            await f.write(request.content)
            
        file_size = len(request.content.encode('utf-8'))
        
        # Extract metadata
        reading_time = None
        if request.metadata and "reading_time" in request.metadata:
            reading_time = request.metadata["reading_time"]
            
        # Create Document record
        document = Document(
            user_id=user_id,
            title=request.title,
            filename=stored_filename,
            original_filename=f"{request.title}.txt",
            size=file_size,
            status="pending",
            source_type="webpage",
            source_url=request.url,
            estimated_reading_time=reading_time
        )
        
        db.add(document)
        await db.flush()
        
        # Link to collection if provided
        if request.collection_id:
            stmt = insert(document_collections).values(
                document_id=document.id,
                collection_id=request.collection_id
            )
            await db.execute(stmt)
            
        await db.commit()
        await db.refresh(document)
        
        # Trigger background processing
        source = str(file_path)
        background_tasks.add_task(
            document_service.process_document,
            document.id,
            source,
            "file", # Treat as file for processing
            document.original_filename
        )
        
        return document
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/selection", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def capture_selection(
    request: SelectionCaptureRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = current_user.id
        
        # Save content to file
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_id = uuid.uuid4()
        stored_filename = f"{file_id}.txt"
        file_path = upload_dir / stored_filename
        
        async with aiofiles.open(file_path, "w", encoding="utf-8") as f:
            await f.write(request.selected_text)
            
        file_size = len(request.selected_text.encode('utf-8'))
            
        # Create Document record
        document = Document(
            user_id=user_id,
            title=request.title,
            filename=stored_filename,
            original_filename=f"{request.title} - Selection.txt",
            size=file_size,
            status="pending",
            source_type="selection",
            source_url=request.url
        )
        
        db.add(document)
        await db.flush()
        
        # Link to collection if provided
        if request.collection_id:
            stmt = insert(document_collections).values(
                document_id=document.id,
                collection_id=request.collection_id
            )
            await db.execute(stmt)
            
        await db.commit()
        await db.refresh(document)
        
        # Trigger background processing
        source = str(file_path)
        background_tasks.add_task(
            document_service.process_document,
            document.id,
            source,
            "file", # Treat as file for processing
            document.original_filename
        )
        
        return document
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
