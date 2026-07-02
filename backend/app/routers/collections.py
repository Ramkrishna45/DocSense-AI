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
