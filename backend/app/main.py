from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.services.embedding_service import EmbeddingService
from app.routers import auth, documents, chat, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and pgvector extension
    await init_db()
    
    # Pre-warm embedding service
    print("Loading embedding model...")
    EmbeddingService()
    print("Embedding model loaded successfully.")
    
    yield
    # Cleanup if needed

app = FastAPI(
    title="AI Knowledge Search Engine",
    description="Backend API for personal knowledge search with RAG",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(search.router)

@app.get("/")
async def root():
    return {"message": "Knowledge Engine API", "version": "1.0.0"}
