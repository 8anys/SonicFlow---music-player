import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/lib/PlayerContext';
import TrackCard from '@/components/music/TrackCard';
import ArtistCard from '@/components/music/ArtistCard';
import AlbumCard from '@/components/music/AlbumCard';
import SectionHeader from '@/components/music/SectionHeader';

export default function Home() {
  const { playTrack } = usePlayer();

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-home'],
    queryFn: () => base44.entities.Track.list('-plays', 20),
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists-home'],
    queryFn: () => base44.entities.Artist.list('-followers', 10),
  });

  const { data: albums = [] } = useQuery({
    queryKey: ['albums-home'],
    queryFn: () => base44.entities.Album.list('-created_date', 10),
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists-home'],
    queryFn: () => base44.entities.Playlist.list('-created_date', 6),
  });

  const trending = tracks.filter(t => t.is_trending).slice(0, 8);
  const topTracks = tracks.slice(0, 8);

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-6 md:p-10 min-h-[220px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          <div className="absolute top-8 right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-20 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">Playlist of the Week</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Top Songs of the Week</h1>
          <p className="text-white/60 text-sm mb-4 max-w-md">The hottest tracks right now. Updated every Monday with the latest hits.</p>
          <Button
            size="lg"
            className="rounded-full bg-white text-black hover:bg-white/90 font-semibold gap-2 px-6"
            onClick={() => topTracks.length > 0 && playTrack(topTracks[0], topTracks)}
          >
            <Play className="w-5 h-5 fill-current" /> Play Now
          </Button>
        </div>
      </div>

      {/* Trending Tracks */}
      {trending.length > 0 && (
        <section>
          <SectionHeader title="Trending Now" linkTo="/discover" />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {trending.map(t => <TrackCard key={t.id} track={t} tracks={trending} />)}
          </div>
        </section>
      )}

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <section>
          <SectionHeader title="Popular Tracks" linkTo="/discover" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topTracks.map(t => <TrackCard key={t.id} track={t} tracks={topTracks} />)}
          </div>
        </section>
      )}

      {/* Top Artists */}
      {artists.length > 0 && (
        <section>
          <SectionHeader title="Top Artists" linkTo="/artists" />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section>
          <SectionHeader title="New Albums" linkTo="/albums" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.slice(0, 5).map(a => <AlbumCard key={a.id} album={a} />)}
          </div>
        </section>
      )}

      {/* Recommended Playlists */}
      {playlists.length > 0 && (
        <section>
          <SectionHeader title="Recommended Playlists" linkTo="/playlists" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {playlists.map(pl => (
              <a key={pl.id} href={`/playlist/${pl.id}`} className="group rounded-xl bg-secondary/40 hover:bg-secondary/70 p-3 transition-all duration-300">
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-purple-500/30 to-blue-500/30">
                  {pl.cover_url && <img src={pl.cover_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <p className="text-sm font-semibold truncate">{pl.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{pl.description || 'Playlist'}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {tracks.length === 0 && artists.length === 0 && albums.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Welcome to Melodify</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Your music library is empty. Add tracks, artists, and albums to get started.
          </p>
        </div>
      )}
    </div>
  );
}