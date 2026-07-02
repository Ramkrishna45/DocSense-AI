"""RAG (Retrieval-Augmented Generation) service."""

import logging
import uuid
from typing import Optional

from sqlalchemy import select, text, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.chunk import Chunk
from app.models.document import Document
from app.models.collection import document_collections

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self) -> None:
        self._llm = None

    def _get_llm(self):
        if self._llm is None:
            from langchain_cohere import ChatCohere
            self._llm = ChatCohere(
                model=settings.LLM_MODEL,
                cohere_api_key=settings.COHERE_API_KEY,
                temperature=0.3,
            )
        return self._llm

    async def search_chunks(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        query_text: str,
        query_embedding: list[float] = None,
        limit: int = 5,
        search_mode: str = "semantic",
        collection_id: Optional[uuid.UUID] = None
    ) -> list[dict]:
        """Search for document chunks using semantic, keyword, or hybrid mode."""
        
        # Base query for document access
        base_query = (
            select(Chunk, Document)
            .join(Document, Chunk.document_id == Document.id)
            .where(
                Document.user_id == user_id,
                Document.status == "completed",
            )
        )
        
        # Filter by collection if provided
        if collection_id:
            base_query = base_query.join(
                document_collections, Document.id == document_collections.c.document_id
            ).where(document_collections.c.collection_id == collection_id)
            
        results = []
        
        if search_mode in ["semantic", "hybrid"] and query_embedding:
            # Semantic Search
            query = base_query.where(Chunk.embedding.isnot(None))
            query = query.add_columns(
                (1 - Chunk.embedding.cosine_distance(query_embedding)).label("similarity_score")
            ).order_by(Chunk.embedding.cosine_distance(query_embedding)).limit(limit)
            
            result = await db.execute(query)
            for chunk, document, similarity_score in result.all():
                results.append({
                    "chunk": chunk,
                    "document": document,
                    "similarity_score": float(similarity_score) if similarity_score else 0.0,
                    "match_type": "semantic"
                })
                
        if search_mode in ["keyword", "hybrid"]:
            # Keyword Search (ILIKE for simple MVP, could use tsvector)
            keywords = query_text.split()
            ilike_conditions = [Chunk.content.ilike(f"%{kw}%") for kw in keywords if len(kw) > 3]
            
            if ilike_conditions:
                kw_query = base_query.where(or_(*ilike_conditions)).limit(limit)
                
                # Add fake similarity score for keyword matches to match structure
                kw_query = kw_query.add_columns(text("0.8 AS similarity_score"))
                
                result = await db.execute(kw_query)
                
                # Merge results without duplicates (by chunk id)
                existing_ids = {r["chunk"].id for r in results}
                
                for chunk, document, similarity_score in result.all():
                    if chunk.id not in existing_ids:
                        results.append({
                            "chunk": chunk,
                            "document": document,
                            "similarity_score": float(similarity_score),
                            "match_type": "keyword"
                        })
                        
        # Sort and slice if hybrid
        if search_mode == "hybrid":
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            results = results[:limit]
            
        return results

    async def generate_answer(
        self,
        question: str,
        search_results: list[dict],
    ) -> dict:
        if not search_results:
            return {
                "answer": "I could not find any relevant information in your uploaded documents.",
                "sources": [],
                "confidence": 0.0,
            }

        context_parts = []
        sources = []

        for i, result in enumerate(search_results, 1):
            chunk = result["chunk"]
            document = result["document"]
            similarity = result["similarity_score"]

            page_info = f"Page {chunk.page_number}" if chunk.page_number else "Section"
            context_parts.append(
                f"[{i}] {chunk.content}\n"
                f"    Source: {document.title}, {page_info}"
            )

            sources.append({
                "document_title": document.title,
                "page_number": chunk.page_number,
                "chunk_number": chunk.chunk_number,
                "excerpt": chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
                "similarity_score": similarity,
                "match_type": result.get("match_type", "semantic")
            })

        context = "\n---\n".join(context_parts)

        prompt = (
            "You are a helpful AI assistant. Answer the user's question ONLY using "
            "the provided context from their uploaded documents.\n\n"
            "If the information is not found in the context, respond with: "
            '"I could not find this information in your uploaded documents."\n\n'
            "Always cite your sources by referencing the document name and page/section number.\n\n"
            f"Context:\n---\n{context}\n---\n\n"
            f"Question: {question}\n\n"
            "Provide a clear, well-structured answer. Reference sources using [1], [2], etc."
        )

        try:
            llm = self._get_llm()
            response = await llm.ainvoke(prompt)
            answer = response.content

            avg_similarity = sum(r["similarity_score"] for r in search_results) / len(search_results)
            confidence = min(max(avg_similarity, 0.0), 1.0)

            return {
                "answer": answer,
                "sources": sources,
                "confidence": confidence,
            }
        except Exception as e:
            logger.error("Failed to generate answer: %s", str(e), exc_info=True)
            return {
                "answer": "I encountered an error while generating a response. Please try again.",
                "sources": sources,
                "confidence": 0.0,
            }

rag_service = RAGService()
