<div align="center">
  <img src="https://via.placeholder.com/1200x300/1e1e2e/6366f1?text=DocSense+AI" alt="Hero Banner" width="100%" />

  <h1>🚀 DocSense AI: Personal Knowledge Search Engine</h1>
  <p>A production-ready, full-stack AI platform to ingest, semantically search, and chat with your private documents using RAG.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-0.115.12-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/AI-Cohere-4285F4?style=for-the-badge&logo=cohere" alt="Cohere AI" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </p>
</div>

---

## 📖 Project Description
DocSense AI is not just another "chat with PDF" clone. It is a highly scalable, multi-modal **Personal Knowledge Search Engine** designed to act as a private AI assistant. Users can upload various knowledge sources (PDFs, URLs, YouTube videos, GitHub repositories), which are automatically processed, chunked, and embedded into a high-dimensional vector space using `pgvector`. 

The system leverages **Retrieval-Augmented Generation (RAG)** to provide highly accurate, hallucination-free answers backed by precise citations to the original source documents.

## ✨ Key Features
* **Multi-Modal Ingestion:** Support for PDFs, DOCX, TXT, Website URLs, YouTube Transcripts, and GitHub READMEs.
* **Smart Summaries:** Automatically generates an AI summary, key topics, and keywords upon ingestion.
* **Global Search Modes:** Find information across all your knowledge via:
  * 🧠 *Semantic Search* (Conceptual match via vectors)
  * 🔤 *Keyword Search* (Exact string match)
  * 🌟 *Hybrid Search* (Best of both worlds)
* **Advanced Citations:** AI chat responses include citations with Document Name, Page Number, Confidence Score, and Match Type.
* **Interactive Navigation:** Clickable source citations and search result cards instantly navigate you to the exact page of the underlying document.
* **Document Management:** Full lifecycle support to manage, delete, and download your knowledge base files.
* **Workspaces / Collections:** Organize knowledge into specific collections (e.g., "College", "Interviews", "Work").
* **Premium UI:** Beautiful dark mode, glassmorphism UI built with Tailwind CSS. Perfectly scaled vector graphics and fluid animations.

## 🧩 Web Extension (DocSense AI Companion)
Extend the power of DocSense AI directly into your browser with our companion Web Extension! 
* **Seamless Ingestion:** Instantly save the current webpage, article, or selected text straight to your DocSense AI knowledge base with a single click.
* **Contextual Search:** Highlight any text on a page to quickly run a semantic search against your private documents.
* **Repository:** Check out the source code and installation instructions here: **[DocSense AI Web Extension on GitHub](https://github.com/Ramkrishna45/DocSense-AI-Extension)**

## 🏗️ Architecture Diagram

```mermaid
graph TD
    A[Client UI - Next.js] -->|REST API| B[FastAPI Backend]
    B --> C[PostgreSQL + pgvector]
    B --> D[Cohere Command-R / Embed]
    
    subgraph AI Pipeline
    E[Upload/URL] --> F[Extraction Service]
    F --> G[Chunking Service]
    G --> H[Embedding Service]
    H --> I[Vector DB Storage]
    end
    
    B -.-> E
```

## 🧠 AI Pipeline
Our backend architecture implements a robust microservice-style RAG pipeline:
1. **Extraction:** Specialized parsers (`PyMuPDF`, `youtube-transcript-api`, `beautifulsoup4`) extract raw text.
2. **Summarization:** Cohere generates a 10k-character initial analysis to provide instant metadata (summaries, keywords).
3. **Chunking:** Text is split using `LangChain`'s RecursiveCharacterTextSplitter with smart overlaps.
4. **Embedding:** Chunks are vectorized using Cohere's state-of-the-art `embed-english-v3.0` model.
5. **Retrieval:** `pgvector` performs cosine similarity searches to find the most relevant context.
6. **Generation:** Cohere's `command-r-08-2024` LLM synthesizes the context and the user query to formulate an accurate answer with citations.

## 💻 Tech Stack
### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS Variables + Framer Motion
- **UI Components:** Headless UI / Radix UI primitives with Custom Glassmorphism

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL with `asyncpg`
- **Vector Search:** `pgvector` extension
- **ORM:** SQLAlchemy 2.0 (Async)
- **Auth:** JWT + Bcrypt

### AI & NLP
- **LLM:** Cohere Command-R (`langchain-cohere`)
- **Embeddings:** Cohere Embed English v3 (`langchain-cohere`)
- **Orchestration:** LangChain

## 🔌 API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | `POST` | Register a new user |
| `/api/auth/login` | `POST` | Authenticate and receive JWT |
| `/api/documents/upload`| `POST` | Ingest file, URL, or YouTube video |
| `/api/documents/{id}`| `GET/DEL` | View or delete specific document metadata |
| `/api/search` | `POST` | Perform Semantic, Keyword, or Hybrid search |
| `/api/chat` | `POST` | Send message and receive RAG-generated answer |

## 🚀 Installation
### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose

### 1. Database Setup
```bash
# Start PostgreSQL with pgvector extension
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the FastAPI server (runs on port 8000)
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the Next.js dev server (runs on port 3000)
npm run dev
```

## 🔑 Environment Variables
### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/knowledge_engine
JWT_SECRET_KEY=your_super_secret_key
COHERE_API_KEY=your_cohere_api_key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
EMBEDDING_MODEL=embed-english-v3.0
LLM_MODEL=command-r-08-2024
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧗 Challenges Faced
- **Dependency Management for Extraction:** Standardizing text extraction from highly varied sources (DOM parsing for URLs, timestamp merging for YouTube, binary reading for PDFs) required a modular extraction service.
- **Vector Operations in Async Context:** Utilizing `pgvector` with SQLAlchemy's `asyncpg` driver required careful attention to syntax and avoiding implicit I/O blocking.
- **Clickable Contextual UI Navigation:** Passing UUID pointers from the deepest layers of the Retrieval Augmented Generation database cleanly to the frontend to allow users to directly access the page matched within a citation.

## 🔮 Future Improvements
- **GraphRAG:** Implementing Knowledge Graphs alongside vectors for complex multi-hop reasoning.
- **Offline LLMs:** Adding support for local models via Ollama.
- **PDF Viewer Integration:** Adding `react-pdf` to visually highlight the exact paragraph matched in the original document.

## 🎓 Learning Outcomes
- Advanced understanding of RAG pipeline optimization and citation mapping.
- Deep dive into PostgreSQL's `pgvector` and cosine similarity mathematics.
- Full-stack performance optimization using Next.js Server Components and FastAPI Background Tasks.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
