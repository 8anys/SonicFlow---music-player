import React, { useState } from 'react';
import { Heart, ListPlus, Play } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlayer } from '@/lib/PlayerContext';
import { addFavoriteTrack } from '@/api/favorites';
import { useSonicAuth } from '@/lib/SonicAuthContext';
import { getDatabasePlaylists } from '@/api/databaseMusic';
import { addTrackToPlaylist } from '@/api/playlists';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function TrackCard({ track, tracks = [], onAuthRequired }) {
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { isAuthenticated } = useSonicAuth();
  const queryClient = useQueryClient();
  const isCurrent = currentTrack?.id === track.id;

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists-all'],
    queryFn: () => getDatabasePlaylists(50).catch(() => []),
    enabled: isAuthenticated && showPlaylistDialog,
  });

  const favoriteMutation = useMutation({
    mutationFn: () => addFavoriteTrack(track),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-tracks'] });
      queryClient.invalidateQueries({ queryKey: ['profile-playlists'] });
    },
  });

  const playlistMutation = useMutation({
    mutationFn: (playlistId) => addTrackToPlaylist(playlistId, track),
    onSuccess: (_, playlistId) => {
      queryClient.invalidateQueries({ queryKey: ['playlists-all'] });
      queryClient.invalidateQueries({ queryKey: ['playlists-sidebar'] });
      queryClient.invalidateQueries({ queryKey: ['playlist-tracks', String(playlistId)] });
      queryClient.invalidateQueries({ queryKey: ['playlist-tracks', playlistId] });
      setShowPlaylistDialog(false);
    },
  });

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) togglePlay();
    else playTrack(track, tracks.length > 0 ? tracks : [track]);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    favoriteMutation.mutate();
  };

  const handlePlaylist = (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    setShowPlaylistDialog(true);
  };

  return (
    <>
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
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white hover:text-primary"
            aria-label="Add to favorites"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlaylist}
            className="absolute top-2 left-2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white hover:text-primary"
            aria-label="Add to playlist"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm font-semibold truncate">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist_name}</p>
      </div>

      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add to playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start rounded-lg"
                onClick={() => playlistMutation.mutate(playlist.id)}
              >
                {playlist.name}
              </Button>
            ))}

            {playlists.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No playlists yet. Create a playlist first from the Playlists page.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
