import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  getSpotifyToken,
  handleSpotifyRedirect,
  isSpotifyConfigured,
  loadSpotifySDK,
  loginSpotify,
  logoutSpotify,
  playSpotifyUri,
} from '@/api/spotify';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState(null);
  const [spotifyError, setSpotifyError] = useState('');
  const spotifyPlayerRef = useRef(null);

  useEffect(() => {
    if (!isSpotifyConfigured()) return;

    let cancelled = false;

    async function initSpotify() {
      try {
        await handleSpotifyRedirect();
        const token = await getSpotifyToken();
        setSpotifyConnected(Boolean(token));

        if (!token || cancelled) return;

        await loadSpotifySDK();
        if (cancelled || spotifyPlayerRef.current) return;

        const player = new window.Spotify.Player({
          name: 'SonicFlow Web Player',
          getOAuthToken: async (callback) => {
            const freshToken = await getSpotifyToken();
            callback(freshToken);
          },
          volume: volume / 100,
        });

        player.addListener('ready', ({ device_id }) => {
          setSpotifyDeviceId(device_id);
          setSpotifyConnected(true);
          setSpotifyError('');
        });

        player.addListener('not_ready', () => {
          setSpotifyDeviceId(null);
        });

        player.addListener('initialization_error', ({ message }) => setSpotifyError(message));
        player.addListener('authentication_error', ({ message }) => setSpotifyError(message));
        player.addListener('account_error', ({ message }) => setSpotifyError(message));
        player.addListener('playback_error', ({ message }) => setSpotifyError(message));

        player.connect();
        spotifyPlayerRef.current = player;
      } catch (error) {
        setSpotifyError(error.message);
      }
    }

    initSpotify();

    return () => {
      cancelled = true;
    };
  }, [volume]);

  useEffect(() => {
    spotifyPlayerRef.current?.setVolume(volume / 100);
  }, [volume]);

  const playTrack = useCallback((track, trackList = []) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    if (trackList.length > 0) {
      setQueue(trackList);
    }
    if (track.spotify_uri) {
      playSpotifyUri(track.spotify_uri, spotifyDeviceId).then((started) => {
        if (!started) setSpotifyError('Spotify playback could not be started. Check Premium account and active device.');
      });
    }
  }, [spotifyDeviceId]);

  const togglePlay = useCallback(() => {
    if (currentTrack?.spotify_uri && spotifyPlayerRef.current) {
      spotifyPlayerRef.current.togglePlay();
    }
    setIsPlaying(prev => !prev);
  }, [currentTrack]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    const next = queue[nextIndex];
    setCurrentTrack(next);
    if (next?.spotify_uri) playSpotifyUri(next.spotify_uri, spotifyDeviceId);
    setProgress(0);
  }, [queue, currentTrack, spotifyDeviceId]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    const previous = queue[prevIndex];
    setCurrentTrack(previous);
    if (previous?.spotify_uri) playSpotifyUri(previous.spotify_uri, spotifyDeviceId);
    setProgress(0);
  }, [queue, currentTrack, spotifyDeviceId]);

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, queue, volume, progress, shuffle, repeat,
      spotifyConnected, spotifyDeviceId, spotifyError,
      playTrack, togglePlay, nextTrack, prevTrack,
      setVolume, setProgress, setShuffle, setRepeat,
      loginSpotify, logoutSpotify,
      spotifyConfigured: isSpotifyConfigured()
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
