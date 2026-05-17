const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/'
const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const AUTH_URL = 'https://accounts.spotify.com/authorize'
const API_URL = 'https://api.spotify.com/v1'

const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
]

export function isSpotifyConfigured() {
  return Boolean(CLIENT_ID)
}

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((result, value) => result + chars[value % chars.length], '')
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function sha256(value) {
  const data = new TextEncoder().encode(value)
  return crypto.subtle.digest('SHA-256', data)
}

export async function loginSpotify() {
  if (!CLIENT_ID) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID is not set')
  }

  const verifier = randomString(64)
  const challenge = base64UrlEncode(await sha256(verifier))
  const state = randomString(24)

  localStorage.setItem('spotify_code_verifier', verifier)
  localStorage.setItem('spotify_auth_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scopes.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    redirect_uri: REDIRECT_URI,
    state,
  })

  window.location.href = `${AUTH_URL}?${params}`
}

export async function handleSpotifyRedirect() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')

  if (!code) return false

  const savedState = localStorage.getItem('spotify_auth_state')
  const verifier = localStorage.getItem('spotify_code_verifier')

  if (!verifier || state !== savedState) return false

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })

  if (!response.ok) return false

  const token = await response.json()
  saveSpotifyToken(token)

  localStorage.removeItem('spotify_code_verifier')
  localStorage.removeItem('spotify_auth_state')
  window.history.replaceState({}, document.title, window.location.pathname)

  return true
}

function saveSpotifyToken(token) {
  const expiresAt = Date.now() + token.expires_in * 1000
  localStorage.setItem('spotify_access_token', token.access_token)
  localStorage.setItem('spotify_refresh_token', token.refresh_token || '')
  localStorage.setItem('spotify_expires_at', String(expiresAt))
}

async function refreshSpotifyToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token')
  if (!refreshToken) return null

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) return null

  const token = await response.json()
  saveSpotifyToken({ ...token, refresh_token: token.refresh_token || refreshToken })
  return token.access_token
}

export async function getSpotifyToken() {
  const accessToken = localStorage.getItem('spotify_access_token')
  const expiresAt = Number(localStorage.getItem('spotify_expires_at') || 0)

  if (!accessToken) return null
  if (Date.now() < expiresAt - 60000) return accessToken

  return refreshSpotifyToken()
}

export function logoutSpotify() {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_refresh_token')
  localStorage.removeItem('spotify_expires_at')
  window.location.reload()
}

export async function searchSpotifyTracks(query, limit = 30) {
  const token = await getSpotifyToken()
  if (!token || !query.trim()) return []

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    market: 'US',
    limit: String(limit),
  })

  const response = await fetch(`${API_URL}/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return []

  const data = await response.json()
  return (data.tracks?.items || []).map((track) => ({
    id: `spotify-${track.id}`,
    spotify_id: track.id,
    spotify_uri: track.uri,
    title: track.name,
    artist_name: track.artists.map((artist) => artist.name).join(', '),
    album_name: track.album?.name,
    genre: 'spotify',
    duration: Math.round(track.duration_ms / 1000),
    plays: track.popularity || 0,
    is_trending: track.popularity >= 70,
    cover_url: track.album?.images?.[0]?.url || '',
    source_url: track.external_urls?.spotify,
    source_name: 'Spotify',
  }))
}

export async function playSpotifyUri(uri, deviceId) {
  const token = await getSpotifyToken()
  if (!token || !deviceId || !uri) return false

  await fetch(`${API_URL}/me/player`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  })

  const response = await fetch(`${API_URL}/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [uri] }),
  })

  return response.ok || response.status === 204
}

export function loadSpotifySDK() {
  if (window.Spotify) return Promise.resolve()

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')
    if (existing) {
      window.onSpotifyWebPlaybackSDKReady = resolve
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
    window.onSpotifyWebPlaybackSDKReady = resolve
  })
}
