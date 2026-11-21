/**
 * API client helper with same-origin credentials for session cookie support.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiError {
  status: number;
  message: string;
  detail?: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set Content-Type to JSON if not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // essential for HttpOnly session cookie
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.title || response.statusText;
    } catch {
      errorDetail = await response.text();
    }
    const error: ApiError = {
      status: response.status,
      message: errorDetail || `Request failed with status ${response.status}`,
    };
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
