<div align="center">
  <img src="frontend/public/trans-logo.svg" alt="DocSense AI Logo" width="600" />

  <br/>
  <br/>

  <h3><strong>The Ultimate Personal Knowledge Search Engine & AI Assistant</strong></h3>
  
  <p>
    Seamlessly ingest, analyze, semantically search, and chat with your private documents using advanced Retrieval-Augmented Generation (RAG).
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Cohere_AI-3959A4?style=for-the-badge&logo=cohere&logoColor=white" alt="Cohere AI" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📖 What is DocSense AI?

**DocSense AI** is a highly scalable, multi-modal knowledge engine designed to serve as your private, hyper-intelligent AI assistant. By allowing you to upload your personal or corporate knowledge bases (PDFs, URLs, YouTube videos, GitHub Repositories), it automatically extracts, processes, and embeds the data into a high-dimensional vector space using `pgvector`.

It utilizes **Retrieval-Augmented Generation (RAG)** powered by the Cohere Command-R LLM to provide highly accurate, hallucination-free answers backed by **precise, clickable citations** directly to your original source documents.

---

## ✨ Features & Capabilities

| 🚀 Feature | 💡 Description |
| :--- | :--- |
| **Multi-Modal Ingestion** | Support for PDFs, DOCX, TXT, Website URLs, YouTube Transcripts, and GitHub READMEs. |
| **Smart Summaries** | Automatically generates an AI summary, key topics, and keywords instantly upon file upload. |
| **Omni-Search Modes** | Find information across all your knowledge via **Semantic**, **Keyword**, or **Hybrid** search. |
| **Interactive Citations** | AI chat responses include smart citations. Click any citation to instantly open the exact page of the document! |
| **Document Workspaces** | Organize knowledge into specific collections (e.g., "College", "Interviews", "Work"). |
| **Premium Aesthetic UI** | Beautiful dark mode, custom glassmorphism, perfectly scaled vector graphics, and fluid Framer Motion animations. |

---

## 🧩 The DocSense AI Companion (Web Extension)

Extend the intelligence of DocSense AI directly into your browser! 

The **DocSense AI Companion** is a dedicated Chrome Extension that bridges the gap between your web browsing and your private knowledge base.

- **⚡ Seamless Ingestion:** Instantly save the current webpage, article, or selected text straight to your DocSense AI backend with a single click.
- **🔍 Contextual Search:** Highlight any text on any webpage to quickly run a semantic search against your private documents.
- **🔗 Source Code & Installation:** Check out the dedicated repository here: **[DocSense-Companion on GitHub](https://github.com/Ramkrishna45/DocSense-Companion)**

---

## 🏗️ Architecture & AI Pipeline

```mermaid
graph TD
    A[Next.js Client] -->|REST API| B[FastAPI Backend]
    B --> C[(PostgreSQL + pgvector)]
    B --> D[Cohere API]
    
    subgraph AI Processing Pipeline
    E[Document Upload] --> F[Extraction Service]
    F --> G[LangChain Text Splitter]
    G --> H[Cohere embed-english-v3.0]
    H --> I[Vector DB Storage]
    end
    
    B -.-> E
```

### The RAG Workflow
1. **Extraction:** Specialized parsers (`PyMuPDF`, `youtube-transcript-api`, `beautifulsoup4`) cleanly extract raw text.
2. **Summarization:** Cohere generates an initial metadata analysis (summaries, key topics) for instant UI feedback.
3. **Chunking:** Text is intelligently split using `LangChain`'s RecursiveCharacterTextSplitter with contextual overlaps.
4. **Embedding:** Chunks are vectorized using Cohere's state-of-the-art `embed-english-v3.0` model.
5. **Retrieval:** `pgvector` executes blazing-fast cosine similarity searches to retrieve the most relevant contextual snippets.
6. **Generation:** Cohere's `command-r-08-2024` synthesizes the retrieved context and user query to formulate accurate answers with strict source tracking.

---

## 💻 Technology Stack

<div align="center">

### Frontend
**Next.js 15 (App Router)** • **TypeScript** • **Tailwind CSS** • **Framer Motion** • **Radix UI**

### Backend
**FastAPI** • **PostgreSQL (asyncpg)** • **pgvector** • **SQLAlchemy 2.0** • **JWT Auth**

### AI & NLP
**Cohere Command-R** • **Cohere Embed v3** • **LangChain**

</div>

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose

### 2. Infrastructure Setup
Start the PostgreSQL database with the `pgvector` extension pre-installed:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create the environment file and fill in your keys
cp .env.example .env
```

**Required Backend Environment Variables (`backend/.env`):**
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/knowledge_engine
JWT_SECRET_KEY=your_super_secret_key
COHERE_API_KEY=your_cohere_api_key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
EMBEDDING_MODEL=embed-english-v3.0
LLM_MODEL=command-r-08-2024
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

**Required Frontend Environment Variables (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the Next.js dev server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the platform!

---

## 📂 Repository Structure
```text
docsense-ai/
├── frontend/             # Next.js 15 Application
│   ├── src/app/          # App Router Pages & Layouts
│   ├── src/components/   # Reusable UI & Glassmorphism Components
│   └── src/lib/          # API & Auth Utilities
├── backend/              # FastAPI Application
│   ├── app/models/       # SQLAlchemy Async Models
│   ├── app/routers/      # API Route Handlers
│   ├── app/schemas/      # Pydantic Validation Models
│   └── app/services/     # Business Logic & AI RAG Pipeline
└── docker-compose.yml    # Vector Database Configuration
```

---

## 🔮 Future Roadmap
- [ ] **GraphRAG:** Implementing Knowledge Graphs alongside vectors for complex multi-hop reasoning.
- [ ] **Offline LLMs:** Adding support for local execution via Ollama for complete data privacy.
- [ ] **Visual PDF Integration:** Integrating `react-pdf` to visually highlight the exact paragraph matched inside the rendered document.

---

<div align="center">
  <p>Built with ❤️ by <strong>Ramkrishna</strong></p>
  <p>
    <a href="https://github.com/Ramkrishna45">GitHub</a> • 
    <a href="https://github.com/Ramkrishna45/DocSense-AI">DocSense AI</a> • 
    <a href="https://github.com/Ramkrishna45/DocSense-Companion">Web Extension</a>
  </p>
</div>
