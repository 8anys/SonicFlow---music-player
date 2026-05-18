async function playlistRequest(path = '', options = {}) {
  const response = await fetch(`/db-api/playlists${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Playlist request failed');
  }

  return data;
}

export function createPlaylist(data) {
  return playlistRequest('', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getPlaylist(playlistId) {
  return playlistRequest(`/${playlistId}`);
}

export function getPlaylistTracks(playlistId) {
  return playlistRequest(`/${playlistId}/tracks`);
}

export function addTrackToPlaylist(playlistId, track) {
  return playlistRequest(`/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify(track),
  });
}
