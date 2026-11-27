import { fetchApi } from './client';

export async function getGenres(signal) {
  return fetchApi('/genres', { signal });
}

export async function getGenreById(id, signal) {
  return fetchApi(`/genres/${encodeURIComponent(id)}`, { signal });
}

export async function createGenre(name) {
  return fetchApi('/genres', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateGenre(id, name) {
  return fetchApi(`/genres/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteGenre(id) {
  return fetchApi(`/genres/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
