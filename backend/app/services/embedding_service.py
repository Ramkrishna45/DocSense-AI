"""Embedding service using HuggingFace sentence-transformers.

Provides a singleton service for generating text embeddings using
the all-MiniLM-L6-v2 model (384 dimensions).
"""

import logging
import threading

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Singleton embedding service with lazy model loading.

    The model is loaded on first use to avoid slow startup times.
    Thread-safe initialization using a lock.
    """

    _instance: "EmbeddingService | None" = None
    _lock: threading.Lock = threading.Lock()

    def __new__(cls) -> "EmbeddingService":
        """Ensure only one instance is created (singleton)."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        """Initialize the service (model loading is deferred)."""
        if self._initialized:
            return
        self._model = None
        self._initialized = True

    def _load_model(self) -> None:
        """Load the HuggingFace embedding model.

        Called lazily on first embed call.
        """
        if self._model is not None:
            return

        logger.info("Loading embedding model using Voyage AI")
        try:
            from langchain_voyageai import VoyageAIEmbeddings

            self._model = VoyageAIEmbeddings(
                model=settings.EMBEDDING_MODEL,
                voyage_api_key=settings.VOYAGE_API_KEY,
            )
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error("Failed to load embedding model: %s", str(e))
            raise RuntimeError(f"Failed to load embedding model: {str(e)}") from e

    def embed_query(self, text: str) -> list[float]:
        """Generate an embedding vector for a single query text.

        Args:
            text: The text to embed.

        Returns:
            A list of 384 float values representing the embedding.

        Raises:
            RuntimeError: If the model fails to load or embed.
            ValueError: If text is empty.
        """
        if not text or not text.strip():
            raise ValueError("Cannot embed empty text")

        self._load_model()
        return self._model.embed_query(text)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """Generate embedding vectors for multiple documents.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors (each 384 floats).

        Raises:
            RuntimeError: If the model fails to load or embed.
            ValueError: If texts list is empty.
        """
        if not texts:
            raise ValueError("Cannot embed empty text list")

        self._load_model()
        return self._model.embed_documents(texts)

    def warm_up(self) -> None:
        """Pre-load the model to avoid cold start on first request."""
        logger.info("Warming up embedding service...")
        self._load_model()
        # Run a test embedding to fully initialize
        self.embed_query("warmup")
        logger.info("Embedding service warmed up successfully")


# Module-level singleton accessor
embedding_service = EmbeddingService()
