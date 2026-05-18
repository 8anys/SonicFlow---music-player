import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Clock, ListMusic, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrackRow from '@/components/music/TrackRow';
import { usePlayer } from '@/lib/PlayerContext';
import { getPlaylist, getPlaylistTracks } from '@/api/playlists';

export default function PlaylistDetail() {
  const { id: playlistId } = useParams();
  const { playTrack } = usePlayer();

  const { data: playlist, isLoading: isLoadingPlaylist } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => getPlaylist(playlistId),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['playlist-tracks', playlistId],
    queryFn: () => getPlaylistTracks(playlistId),
    enabled: Boolean(playlistId),
  });

  if (isLoadingPlaylist) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  if (!playlist) {
    return <div className="p-6 text-center text-muted-foreground">Playlist not found</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          {playlist.cover_url ? (
            <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ListMusic className="w-16 h-16 text-primary/40" />
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Playlist</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{playlist.name}</h1>
          {playlist.description && <p className="text-sm text-muted-foreground mb-2">{playlist.description}</p>}
          <p className="text-sm text-muted-foreground">{tracks.length} songs</p>
          <div className="flex gap-3 mt-4">
            <Button
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 gap-2 px-8"
              onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}
              disabled={tracks.length === 0}
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
            {tracks.map((track, index) => <TrackRow key={track.id} track={track} index={index} tracks={tracks} />)}
          </div>
        </>
      )}

      {tracks.length === 0 && (
        <p className="text-center text-muted-foreground py-10">
          This playlist is empty. Add tracks from Home or Discover using the playlist button on a track card.
        </p>
      )}
    </div>
  );
}
