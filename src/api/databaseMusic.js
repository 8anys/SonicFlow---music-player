async function getJson(path) {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`)
  }

  return response.json()
}

export async function getDatabaseTracks({ query = '', genre = 'all', artist = '', album = '', releaseYear = '', limit = 50 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    sort: 'popular',
  })

  if (query) params.set('q', query)
  if (genre && genre !== 'all') params.set('genre', genre)
  if (artist) params.set('artist', artist)
  if (album) params.set('album', album)
  if (releaseYear) params.set('release_year', releaseYear)

  return getJson(`/db-api/tracks?${params}`)
}

export function getDatabaseArtists(limit = 50) {
  return getJson(`/db-api/artists?limit=${limit}`)
}

export function getDatabaseAlbums(limit = 50) {
  return getJson(`/db-api/albums?limit=${limit}`)
}

export function getDatabasePlaylists(limit = 50) {
  return getJson(`/db-api/playlists?limit=${limit}`)
}
