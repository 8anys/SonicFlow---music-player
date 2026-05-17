import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlayer } from '@/lib/PlayerContext';
import { Heart, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrackRow from '@/components/music/TrackRow';

export default function Favorites() {
  const { playTrack } = usePlayer();
  const queryClient = useQueryClient();

  const { data: liked = [] } = useQuery({
    queryKey: ['liked-songs'],
    queryFn: () => base44.entities.LikedSong.list('-created_date', 200),
  });

  const { data: allTracks = [] } = useQuery({
    queryKey: ['all-tracks-fav'],
    queryFn: () => base44.entities.Track.list('-created_date', 200),
  });

  const tracks = liked.map(l => allTracks.find(t => t.id === l.track_id)).filter(Boolean);
  const likedIds = new Set(liked.map(l => l.track_id));

  const unlikeMutation = useMutation({
    mutationFn: async (track) => {
      const likedSong = liked.find(l => l.track_id === track.id);
      if (likedSong) await base44.entities.LikedSong.delete(likedSong.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['liked-songs'] }),
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Heart className="w-16 h-16 text-white fill-white" />
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Liked Songs</h1>
          <p className="text-sm text-muted-foreground">{tracks.length} songs</p>
          <div className="flex gap-3 mt-4">
            <Button
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 gap-2 px-8"
              onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}
            >
              <Play className="w-5 h-5" /> Play All
            </Button>
          </div>
        </div>
      </div>

      {tracks.length > 0 && (
        <>
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground border-b border-border mb-2">
            <span className="w-8 text-center">#</span>
            <span className="w-10" />
            <span className="flex-1">Title</span>
            <Clock className="w-4 h-4 ml-auto" />
          </div>
          <div className="space-y-0.5">
            {tracks.map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                tracks={tracks}
                isLiked={likedIds.has(t.id)}
                onLike={(track) => unlikeMutation.mutate(track)}
              />
            ))}
          </div>
        </>
      )}

      {tracks.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-lg font-medium">No liked songs yet</p>
          <p className="text-sm mt-1">Songs you like will appear here</p>
        </div>
      )}
    </div>
  );
}