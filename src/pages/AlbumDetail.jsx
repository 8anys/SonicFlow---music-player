import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlayer } from '@/lib/PlayerContext';
import { Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrackRow from '@/components/music/TrackRow';

export default function AlbumDetail() {
  const params = new URLSearchParams(window.location.search);
  const urlParts = window.location.pathname.split('/');
  const albumId = urlParts[urlParts.length - 1];
  const { playTrack } = usePlayer();

  const { data: albums = [] } = useQuery({
    queryKey: ['album', albumId],
    queryFn: () => base44.entities.Album.filter({ id: albumId }),
  });

  const album = albums[0];

  const { data: tracks = [] } = useQuery({
    queryKey: ['album-tracks', album?.title],
    queryFn: () => base44.entities.Track.filter({ album_name: album?.title }),
    enabled: !!album?.title,
  });

  if (!album) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl bg-secondary">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500" />
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Album</p>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{album.title}</h1>
          <p className="text-sm text-muted-foreground">
            {album.artist_name} {album.release_year && `· ${album.release_year}`} · {tracks.length} songs
          </p>
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

      {/* Track list */}
      <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground border-b border-border mb-2">
        <span className="w-8 text-center">#</span>
        <span className="w-10" />
        <span className="flex-1">Title</span>
        <Clock className="w-4 h-4 ml-auto" />
      </div>
      <div className="space-y-0.5">
        {tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i} tracks={tracks} />)}
      </div>

      {tracks.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No tracks in this album yet</p>
      )}
    </div>
  );
}