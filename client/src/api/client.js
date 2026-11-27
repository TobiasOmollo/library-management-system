import { authStorage } from './authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal fetch wrapper that manages authentication tokens,
 * JSON serialization, and error mapping.
 */
export async function fetchApi(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getToken();

  const headers = new Headers(options.headers || {});

  // Set default content type for JSON payloads if not already set
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach JWT Bearer token if available
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    if (networkError.name === 'AbortError') {
      throw networkError;
    }
    throw new ApiError('Unable to connect to the library server. Please check your connection.', 0);
  }

  // Auto logout on 401 Unauthorized
  if (response.status === 401) {
    authStorage.clearToken();
    window.dispatchEvent(new CustomEvent('mmu:unauthorized'));
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(', ');
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMessage = data;
    }
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}
