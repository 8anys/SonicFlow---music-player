import React, { createContext, useContext, useState, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const playTrack = useCallback((track, trackList = []) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    if (trackList.length > 0) {
      setQueue(trackList);
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentTrack(queue[nextIndex]);
    setProgress(0);
  }, [queue, currentTrack]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentTrack(queue[prevIndex]);
    setProgress(0);
  }, [queue, currentTrack]);

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, queue, volume, progress, shuffle, repeat,
      playTrack, togglePlay, nextTrack, prevTrack,
      setVolume, setProgress, setShuffle, setRepeat
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