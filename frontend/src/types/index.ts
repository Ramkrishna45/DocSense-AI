export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  original_filename: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  created_at: string;
  source_type?: string;
  source_url?: string;
  summary?: string;
  key_topics?: string[];
  keywords?: string[];
  estimated_reading_time?: number;
}

export interface Collection {
  id: string;
  name: string;
  created_at: string;
  document_count?: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: SourceInfo[] | null;
  confidence: number | null;
  created_at: string;
}

export interface SourceInfo {
  document_id: string;
  document_title: string;
  page_number: number | null;
  chunk_number: number;
  excerpt: string;
  similarity_score?: number;
  match_type?: string;
}

export interface SearchResult {
  document_id: string;
  document_title: string;
  page_number: number | null;
  chunk_number: number;
  content: string;
  similarity_score: number;
  match_type?: string;
}

export interface UserStats {
  document_count: number;
  total_size: number;
  total_chunks: number;
  conversation_count: number;
  message_count: number;
}
