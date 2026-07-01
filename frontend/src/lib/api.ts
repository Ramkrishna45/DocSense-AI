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
export async function apiFetch<T = unknown>(
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
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    const message =
      typeof errorBody.detail === 'string'
        ? errorBody.detail
        : Array.isArray(errorBody.detail)
          ? errorBody.detail.map((e: { msg: string }) => e.msg).join(', ')
          : res.statusText;
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
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || 'Login failed');
  }

  return res.json();
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
  return apiFetch<Document[]>('/api/documents');
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
): Promise<{ message: Message; conversation_id: string }> {
  return apiFetch('/api/chat/message', {
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
): Promise<{ conversation: Conversation; messages: Message[] }> {
  return apiFetch(`/api/chat/conversations/${conversationId}`);
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
