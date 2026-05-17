import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Heart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/lib/PlayerContext';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const {
    currentTrack, isPlaying, volume, progress, shuffle, repeat,
    togglePlay, nextTrack, prevTrack, setVolume, setProgress, setShuffle, setRepeat
  } = usePlayer();

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const duration = currentTrack.duration || 210;
          if (prev >= duration) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentTrack, nextTrack, setProgress]);

  if (!currentTrack) return null;

  const duration = currentTrack.duration || 210;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 glass-strong z-50 flex items-center px-4 md:px-6 gap-4">
      {/* Track Info */}
      <div className="flex items-center gap-3 w-56 min-w-0 flex-shrink-0">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
          {currentTrack.cover_url ? (
            <img src={currentTrack.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist_name}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary flex-shrink-0">
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-1">
          <Button variant="ghost" size="icon" className={`h-8 w-8 ${shuffle ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setShuffle(!shuffle)}>
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={prevTrack}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/90"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={nextTrack}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className={`h-8 w-8 ${repeat ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => setRepeat(!repeat)}>
            <Repeat className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-muted-foreground w-8 text-right">{formatTime(progress)}</span>
          <Slider
            value={[progress]}
            max={duration}
            step={1}
            onValueChange={([v]) => setProgress(v)}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="hidden md:flex items-center gap-2 w-36 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setVolume(volume === 0 ? 75 : 0)}>
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={([v]) => setVolume(v)}
          className="flex-1"
        />
      </div>
    </div>
  );
}