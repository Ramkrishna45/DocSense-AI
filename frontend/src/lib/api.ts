import type {
  User,
  Document,
  Conversation,
  Message,
  SearchResult,
  UserStats,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ─── Token helpers ─── */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('auth_token');
}

/* ─── Generic fetch wrapper ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errorBody: any;
    try {
      errorBody = await res.json();
      console.error('API Error Response:', errorBody);
    } catch (_) {
      errorBody = { detail: res.statusText || 'Unknown error' };
    }
    
    let message = 'API Request Failed';
    if (errorBody && errorBody.detail) {
      if (typeof errorBody.detail === 'string') {
        message = errorBody.detail;
      } else if (Array.isArray(errorBody.detail)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message = errorBody.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
      } else {
        message = JSON.stringify(errorBody.detail);
      }
    } else if (errorBody && errorBody.message) {
      message = errorBody.message;
    } else if (res.statusText) {
      message = res.statusText;
    }
    
    throw new Error(message);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/* ─── Auth ─── */
export async function login(
  email: string,
  password: string,
): Promise<{ access_token: string; token_type: string }> {
  return apiFetch<{ access_token: string; token_type: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  return apiFetch<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}

/* ─── Documents ─── */
export async function getDocuments(): Promise<Document[]> {
  const res = await apiFetch<{ documents: Document[]; total: number }>('/api/documents');
  return res.documents || [];
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<Document>('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/api/documents/${id}`, {
    method: 'DELETE',
  });
}

export async function renameDocument(
  id: string,
  title: string,
): Promise<Document> {
  return apiFetch<Document>(`/api/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function downloadDocument(id: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/documents/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Download failed');
  return res.blob();
}

/* ─── Stats ─── */
export async function getStats(): Promise<UserStats> {
  return apiFetch<UserStats>('/api/documents/stats');
}

/* ─── Chat ─── */
export async function sendChatMessage(
  message: string,
  conversationId?: string,
): Promise<{ message: string; sources: SourceInfo[]; conversation_id: string; confidence?: number }> {
  return apiFetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      conversation_id: conversationId || null,
    }),
  });
}

export async function getConversations(): Promise<Conversation[]> {
  return apiFetch<Conversation[]>('/api/chat/conversations');
}

export async function getConversationMessages(
  conversationId: string,
): Promise<Message[]> {
  return apiFetch<Message[]>(`/api/chat/conversations/${conversationId}`);
}

export async function deleteConversation(id: string): Promise<void> {
  return apiFetch<void>(`/api/chat/conversations/${id}`, {
    method: 'DELETE',
  });
}

/* ─── Search ─── */
export async function searchDocuments(
  query: string,
): Promise<SearchResult[]> {
  return apiFetch<SearchResult[]>('/api/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}
