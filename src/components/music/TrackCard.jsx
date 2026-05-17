import React from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '@/lib/PlayerContext';

export default function TrackCard({ track, tracks = [] }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) togglePlay();
    else playTrack(track, tracks.length > 0 ? tracks : [track]);
  };

  return (
    <div className="group relative rounded-xl bg-secondary/40 hover:bg-secondary/70 p-3 transition-all duration-300 cursor-pointer min-w-[160px]">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-secondary">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30" />
        )}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
        >
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        </button>
      </div>
      <p className="text-sm font-semibold truncate">{track.title}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist_name}</p>
    </div>
  );
}