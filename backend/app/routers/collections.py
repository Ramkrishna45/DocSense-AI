from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List
import uuid

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.collection import Collection, document_collections
from app.schemas.collection import CollectionCreate, CollectionResponse

router = APIRouter(prefix="/api/collections", tags=["collections"])

@router.get("", response_model=List[CollectionResponse])
async def list_collections(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Query collections with document count
    result = await db.execute(
        select(
            Collection,
            func.count(document_collections.c.document_id).label("document_count")
        )
        .outerjoin(document_collections, Collection.id == document_collections.c.collection_id)
        .where(Collection.user_id == current_user.id)
        .group_by(Collection.id)
        .order_by(Collection.created_at.desc())
    )
    
    collections_data = []
    for row in result.all():
        collection_obj, doc_count = row
        collections_data.append(
            CollectionResponse(
                id=collection_obj.id,
                name=collection_obj.name,
                created_at=collection_obj.created_at,
                document_count=doc_count
            )
        )
    return collections_data

@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: CollectionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_collection = Collection(
        name=collection_data.name,
        user_id=current_user.id
    )
    db.add(new_collection)
    await db.commit()
    await db.refresh(new_collection)
    
    return CollectionResponse(
        id=new_collection.id,
        name=new_collection.name,
        created_at=new_collection.created_at,
        document_count=0
    )

@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Collection)
        .where(Collection.id == collection_id, Collection.user_id == current_user.id)
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
        
    await db.delete(collection)
    await db.commit()
    
    return {"message": "Collection deleted successfully"}

@router.post("/{collection_id}/documents/{document_id}")
async def add_document_to_collection(
    collection_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import insert
    from app.models.document import Document
    
    # Verify collection belongs to user
    result = await db.execute(select(Collection).where(Collection.id == collection_id, Collection.user_id == current_user.id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
        
    # Verify document belongs to user
    result = await db.execute(select(Document).where(Document.id == document_id, Document.user_id == current_user.id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    # Check if already in collection
    result = await db.execute(
        select(document_collections).where(
            document_collections.c.collection_id == collection_id,
            document_collections.c.document_id == document_id
        )
    )
    if result.first():
        return {"message": "Document already in collection"}
        
    # Add to collection
    await db.execute(
        insert(document_collections).values(collection_id=collection_id, document_id=document_id)
    )
    await db.commit()
    
    return {"message": "Document added to collection successfully"}

@router.delete("/{collection_id}/documents/{document_id}")
async def remove_document_from_collection(
    collection_id: uuid.UUID,
    document_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify collection belongs to user
    result = await db.execute(select(Collection).where(Collection.id == collection_id, Collection.user_id == current_user.id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
        
    await db.execute(
        delete(document_collections).where(
            document_collections.c.collection_id == collection_id,
            document_collections.c.document_id == document_id
        )
    )
    await db.commit()
    
    return {"message": "Document removed from collection successfully"}

@router.get("/{collection_id}/documents")
async def list_collection_documents(
    collection_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.document import Document
    from app.schemas.document import DocumentResponse
    
    # Verify collection belongs to user
    result = await db.execute(select(Collection).where(Collection.id == collection_id, Collection.user_id == current_user.id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
        
    result = await db.execute(
        select(Document)
        .join(document_collections, Document.id == document_collections.c.document_id)
        .where(document_collections.c.collection_id == collection_id)
        .order_by(Document.created_at.desc())
    )
    
    documents = result.scalars().all()
    return documents
