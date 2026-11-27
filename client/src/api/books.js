import { fetchApi } from './client';

export async function getBooks({ page = 1, limit = 12, q = '', genreId = '' } = {}, signal) {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  if (q && q.trim()) params.set('q', q.trim());
  if (genreId && genreId.trim()) params.set('genreId', genreId.trim());

  const queryString = params.toString();
  return fetchApi(`/books${queryString ? `?${queryString}` : ''}`, { signal });
}

export async function getBookById(id, signal) {
  return fetchApi(`/books/${encodeURIComponent(id)}`, { signal });
}

export async function createBook(bookData) {
  return fetchApi('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  });
}

export async function updateBook(id, bookData) {
  return fetchApi(`/books/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(bookData),
  });
}

export async function deleteBook(id) {
  return fetchApi(`/books/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
