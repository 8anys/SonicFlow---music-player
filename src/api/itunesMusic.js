const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search'

const popularSearches = [
  'Golden HUNTR/X',
  'Michael Jackson Billie Jean',
  'Michael Jackson Beat It',
  'Justin Bieber Beauty and a Beat',
  'Tame Impala Jennie Dracula',
  'BABYMONSTER CHOOM',
  'Arijit Singh',
  'Billie Eilish',
  'Taylor Swift',
  'The Weeknd',
]

function getArtwork(url) {
  return url ? url.replace('100x100bb', '600x600bb') : ''
}

function mapTrack(result) {
  return {
    id: `itunes-${result.trackId}`,
    title: result.trackName,
    artist_name: result.artistName,
    album_name: result.collectionName,
    genre: result.primaryGenreName?.toLowerCase() || 'pop',
    duration: Math.round((result.trackTimeMillis || 210000) / 1000),
    plays: 0,
    is_trending: true,
    cover_url: getArtwork(result.artworkUrl100),
    audio_url: result.previewUrl,
    preview_url: result.previewUrl,
    source_url: result.trackViewUrl,
    source_name: 'iTunes Preview',
  }
}

export async function searchITunesTracks(query, limit = 25) {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'song',
    attribute: 'songTerm',
    country: 'US',
    limit: String(limit),
  })

  const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`)

  if (!response.ok) {
    throw new Error('Failed to search iTunes music')
  }

  const data = await response.json()
  return (data.results || []).filter((track) => track.previewUrl).map(mapTrack)
}

export async function getPopularPreviewTracks() {
  const results = await Promise.allSettled(
    popularSearches.map((query) => searchITunesTracks(query, 3))
  )

  const tracks = results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
  const uniqueTracks = new Map()

  tracks.forEach((track, index) => {
    if (!uniqueTracks.has(track.id)) {
      uniqueTracks.set(track.id, {
        ...track,
        plays: 50000000 - index * 1000000,
        is_trending: index < 10,
      })
    }
  })

  return [...uniqueTracks.values()].slice(0, 24)
}
