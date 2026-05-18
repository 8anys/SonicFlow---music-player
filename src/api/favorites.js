async function favoritesRequest(path = '', options = {}) {
  const response = await fetch(`/db-api/favorites${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Favorites request failed');
  }

  return data;
}

export function getFavoriteTracks() {
  return favoritesRequest();
}

export function addFavoriteTrack(track) {
  return favoritesRequest('', {
    method: 'POST',
    body: JSON.stringify(track),
  });
}

export function removeFavoriteTrack(trackId) {
  return favoritesRequest(`/${trackId}`, {
    method: 'DELETE',
  });
}
