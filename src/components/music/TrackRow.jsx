import React from 'react';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/lib/PlayerContext';

export default function TrackRow({ track, index, tracks = [], showCover = true, onLike, isLiked }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  const formatDuration = (s) => {
    if (!s) return '3:30';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-secondary/60 cursor-pointer
        ${isCurrent ? 'bg-primary/10' : ''}`}
      onClick={handlePlay}
    >
      <div className="w-8 text-center flex-shrink-0">
        <span className={`text-sm group-hover:hidden ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
          {index !== undefined ? index + 1 : '•'}
        </span>
        <div className="hidden group-hover:block">
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 text-primary mx-auto" />
          ) : (
            <Play className="w-4 h-4 text-foreground mx-auto" />
          )}
        </div>
      </div>

      {showCover && (
        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
          {track.cover_url ? (
            <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : ''}`}>{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist_name}</p>
      </div>

      <span className="text-xs text-muted-foreground hidden sm:block">{track.album_name || ''}</span>

      <div className="flex items-center gap-1 ml-auto">
        {onLike && (
          <Button
            variant="ghost" size="icon"
            className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${isLiked ? 'text-primary opacity-100' : 'text-muted-foreground'}`}
            onClick={(e) => { e.stopPropagation(); onLike(track); }}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary' : ''}`} />
          </Button>
        )}
        <span className="text-xs text-muted-foreground w-10 text-right">{formatDuration(track.duration)}</span>
      </div>
    </div>
  );
}