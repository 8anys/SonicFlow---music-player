const AUDIUS_API_URL = 'https://api.audius.co/v1'

function mapAudiusTrack(track) {
  return {
    id: `audius-${track.id || track.track_id}`,
    audius_id: track.id,
    title: track.title,
    artist_name: track.user?.name || track.user?.handle || 'Audius Artist',
    album_name: track.genre || 'Audius',
    release_year: track.release_date ? new Date(track.release_date).getFullYear() : undefined,
    genre: track.genre?.toLowerCase() || 'electronic',
    duration: track.duration || 210,
    plays: track.play_count || 0,
    is_trending: true,
    cover_url: track.artwork?.['1000x1000'] || track.artwork?.['480x480'] || track.artwork?.['150x150'] || '',
    audio_url: track.stream?.url || `${AUDIUS_API_URL}/tracks/${track.id}/stream`,
    source_url: track.permalink ? `https://audius.co${track.permalink}` : 'https://audius.co',
    source_name: 'Audius',
  }
}

async function requestAudius(path) {
  const response = await fetch(`${AUDIUS_API_URL}${path}`)

  if (!response.ok) {
    throw new Error('Failed to load Audius music')
  }

  const data = await response.json()
  return data.data || []
}

export async function getAudiusTrendingTracks(limit = 30) {
  const tracks = await requestAudius(`/tracks/trending?limit=${limit}`)
  return tracks.filter((track) => track.is_streamable !== false).map(mapAudiusTrack)
}

export async function searchAudiusTracks(query, limit = 30) {
  if (!query.trim()) return getAudiusTrendingTracks(limit)

  const params = new URLSearchParams({
    query,
    limit: String(limit),
  })

  const tracks = await requestAudius(`/tracks/search?${params}`)
  return tracks.filter((track) => track.is_streamable !== false).map(mapAudiusTrack)
}
