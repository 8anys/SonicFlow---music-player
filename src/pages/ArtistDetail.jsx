import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlayer } from '@/lib/PlayerContext';
import { Play, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrackRow from '@/components/music/TrackRow';
import AlbumCard from '@/components/music/AlbumCard';
import SectionHeader from '@/components/music/SectionHeader';

export default function ArtistDetail() {
  const urlParts = window.location.pathname.split('/');
  const artistId = urlParts[urlParts.length - 1];
  const { playTrack } = usePlayer();

  const { data: artists = [] } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => base44.entities.Artist.filter({ id: artistId }),
  });

  const artist = artists[0];

  const { data: tracks = [] } = useQuery({
    queryKey: ['artist-tracks', artist?.name],
    queryFn: () => base44.entities.Track.filter({ artist_name: artist?.name }),
    enabled: !!artist?.name,
  });

  const { data: albums = [] } = useQuery({
    queryKey: ['artist-albums', artist?.name],
    queryFn: () => base44.entities.Album.filter({ artist_name: artist?.name }),
    enabled: !!artist?.name,
  });

  if (!artist) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  const formatNumber = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div>
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {artist.banner_url ? (
          <img src={artist.banner_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-6 md:left-8 flex items-end gap-5">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-background shadow-2xl bg-secondary">
            {artist.image_url ? (
              <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500/40 to-blue-500/40" />
            )}
          </div>
          <div className="mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Artist</p>
            <h1 className="text-3xl md:text-5xl font-extrabold">{artist.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{formatNumber(artist.followers)} followers</span>
              <span>{formatNumber(artist.monthly_listeners)} monthly listeners</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-8">
        <div className="flex gap-3">
          <Button
            size="lg"
            className="rounded-full bg-primary hover:bg-primary/90 gap-2 px-8"
            onClick={() => tracks.length > 0 && playTrack(tracks[0], tracks)}
          >
            <Play className="w-5 h-5" /> Play
          </Button>
        </div>

        {artist.bio && <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{artist.bio}</p>}

        {/* Popular Tracks */}
        {tracks.length > 0 && (
          <section>
            <SectionHeader title="Popular" />
            <div className="space-y-0.5">
              {tracks.slice(0, 5).map((t, i) => <TrackRow key={t.id} track={t} index={i} tracks={tracks} />)}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section>
            <SectionHeader title="Albums" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {albums.map(a => <AlbumCard key={a.id} album={a} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}