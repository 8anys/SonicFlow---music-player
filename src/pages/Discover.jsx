import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrackCard from '@/components/music/TrackCard';
import { withPopularFallback } from '@/data/popularMusic';
import { searchITunesTracks } from '@/api/itunesMusic';
import { searchSpotifyTracks } from '@/api/spotify';
import { usePlayer } from '@/lib/PlayerContext';

const GENRES = ['all', 'pop', 'rock', 'hip-hop', 'electronic', 'r&b', 'jazz', 'indie', 'latin'];

export default function Discover() {
  const [genre, setGenre] = useState('all');
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q') || '';
  const { spotifyConnected, spotifyError } = usePlayer();

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-discover'],
    queryFn: () => base44.entities.Track.list('-plays', 50),
  });

  const { data: streamingTracks = [] } = useQuery({
    queryKey: ['itunes-search', searchQuery],
    queryFn: () => searchITunesTracks(searchQuery || 'top songs', 30),
    staleTime: 1000 * 60 * 30,
  });

  const { data: spotifyTracks = [] } = useQuery({
    queryKey: ['spotify-search', searchQuery, spotifyConnected],
    queryFn: () => searchSpotifyTracks(searchQuery || 'top songs', 40),
    enabled: spotifyConnected,
    staleTime: 1000 * 60 * 10,
  });

  const musicCatalog = withPopularFallback([...spotifyTracks, ...tracks, ...streamingTracks], 20);

  const filtered = musicCatalog.filter(t => {
    const genreMatch = genre === 'all' || t.genre === genre;
    const searchMatch = !searchQuery || t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.artist_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return genreMatch && searchMatch;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Discover</h1>
        <p className="text-sm text-muted-foreground">
          {searchQuery ? `Results for "${searchQuery}"` : 'Explore new music by genre'}
        </p>
        {spotifyConnected && (
          <p className="text-xs text-primary mt-1">Spotify streaming is connected</p>
        )}
        {spotifyError && (
          <p className="text-xs text-destructive mt-1">{spotifyError}</p>
        )}
      </div>

      <Tabs value={genre} onValueChange={setGenre}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          {GENRES.map(g => (
            <TabsTrigger key={g} value={g} className="capitalize text-xs px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full">
              {g === 'all' ? 'All Genres' : g}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(t => <TrackCard key={t.id} track={t} tracks={filtered} />)}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No tracks found</p>
          <p className="text-sm mt-1">Try a different genre or search term</p>
        </div>
      )}
    </div>
  );
}
