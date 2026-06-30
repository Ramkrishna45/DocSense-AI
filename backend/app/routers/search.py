from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.search import SearchRequest, SearchResponse, SearchResult
from app.services.rag_service import rag_service
from app.services.embedding_service import embedding_service

router = APIRouter(prefix="/api/search", tags=["search"])

@router.post("", response_model=SearchResponse)
async def semantic_search(
    search_request: SearchRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        query_embedding = None
        if search_request.search_mode in ["semantic", "hybrid"]:
            query_embedding = embedding_service.embed_query(search_request.query)
            
        collection_id = None
        if search_request.collection_id:
            try:
                collection_id = uuid.UUID(search_request.collection_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid collection ID")

        chunks = await rag_service.search_chunks(
            db, 
            uuid.UUID(current_user["id"]), 
            search_request.query,
            query_embedding, 
            search_request.limit,
            search_request.search_mode,
            collection_id
        )
        
        results = []
        for result in chunks:
            chunk = result["chunk"]
            document = result["document"]
            results.append(SearchResult(
                document_title=document.title if document else "Unknown",
                page_number=chunk.page_number,
                chunk_number=chunk.chunk_number,
                content=chunk.content,
                similarity_score=result["similarity_score"],
                match_type=result["match_type"]
            ))
            
        return SearchResponse(results=results, query=search_request.query)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
