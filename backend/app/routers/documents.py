from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.document import DocumentResponse, DocumentRename, DocumentListResponse
from app.services import document_service

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    source_url: Optional[str] = Form(None),
    source_type: str = Form("file"),
    title: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        user_id = current_user.id
        
        # Upload or register source
        doc = await document_service.upload_document(
            db=db, 
            user_id=user_id, 
            file=file, 
            source_url=source_url, 
            source_type=source_type,
            title=title
        )
        
        # Trigger background processing
        source = source_url if source_type != "file" else f"uploads/{doc.filename}"
        if source_type == "file":
            source = str(document_service.Path(document_service.settings.UPLOAD_DIR) / doc.filename)
            
        background_tasks.add_task(
            document_service.process_document,
            doc.id,
            source,
            source_type,
            file.filename if file else ""
        )
        
        return doc
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("", response_model=DocumentListResponse)
async def list_documents(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    docs = await document_service.get_user_documents(db, current_user.id)
    return DocumentListResponse(documents=docs, total=len(docs))

@router.get("/stats")
async def get_document_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stats = await document_service.get_user_stats(db, current_user.id)
    return stats

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    doc = await document_service.get_document(db, document_id, current_user.id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc

@router.delete("/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    success = await document_service.delete_document(db, document_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return {"message": "Document deleted successfully"}

@router.patch("/{document_id}/rename", response_model=DocumentResponse)
async def rename_document(
    document_id: uuid.UUID,
    rename_data: DocumentRename,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    doc = await document_service.rename_document(db, document_id, current_user.id, rename_data.title)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc
