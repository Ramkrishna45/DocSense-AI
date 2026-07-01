"""Text chunking utility using LangChain's RecursiveCharacterTextSplitter.

Splits extracted document text into overlapping chunks while preserving
page number metadata for each chunk.
"""

import logging

from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

# Configure the text splitter with optimal settings for retrieval
_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,
    chunk_overlap=400,
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""],
    is_separator_regex=False,
)


def chunk_text(pages: list[tuple[int | None, str]]) -> list[dict]:
    """Split document text into overlapping chunks with metadata.

    Takes a list of (page_number, text) tuples (as produced by file_processor)
    and splits them into chunks using RecursiveCharacterTextSplitter.
    Each chunk preserves the page number of its source page.

    Args:
        pages: List of (page_number, text) tuples from file extraction.
               page_number can be None for non-paginated formats.

    Returns:
        List of dicts with keys:
        - chunk_number (int): Sequential 1-indexed chunk number.
        - page_number (int | None): Source page number.
        - content (str): The chunk text content.
    """
    if not pages:
        logger.warning("No pages provided for chunking")
        return []

    chunks: list[dict] = []
    chunk_number = 1

    for page_number, text in pages:
        if not text.strip():
            continue

        # Split the page text into chunks
        page_chunks = _splitter.split_text(text)

        for chunk_content in page_chunks:
            if chunk_content.strip():
                chunks.append({
                    "chunk_number": chunk_number,
                    "page_number": page_number,
                    "content": chunk_content.strip(),
                })
                chunk_number += 1

    logger.info("Created %d chunks from %d pages", len(chunks), len(pages))
    return chunks
