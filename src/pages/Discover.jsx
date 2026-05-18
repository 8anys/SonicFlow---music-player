import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrackCard from '@/components/music/TrackCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { withPopularFallback } from '@/data/popularMusic';
import { searchITunesTracks } from '@/api/itunesMusic';
import { searchSpotifyTracks } from '@/api/spotify';
import { usePlayer } from '@/lib/PlayerContext';
import { searchAudiusTracks } from '@/api/audiusMusic';
import { getDatabaseTracks } from '@/api/databaseMusic';
import AuthPage from '@/pages/AuthPage';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const GENRES = ['all', 'pop', 'rock', 'hip-hop', 'electronic', 'r&b', 'jazz', 'indie', 'latin'];

export default function Discover() {
  const [genre, setGenre] = useState('all');
  const [showAuth, setShowAuth] = useState(false);
  const [artistFilter, setArtistFilter] = useState('');
  const [albumFilter, setAlbumFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q') || '';
  const { spotifyConnected, spotifyError } = usePlayer();

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks-discover', searchQuery, genre, artistFilter, albumFilter, yearFilter],
    queryFn: () => getDatabaseTracks({
      query: searchQuery,
      genre,
      artist: artistFilter,
      album: albumFilter,
      releaseYear: yearFilter,
      limit: 50,
    }).catch(() => []),
  });

  const { data: streamingTracks = [] } = useQuery({
    queryKey: ['itunes-search', searchQuery],
    queryFn: () => searchITunesTracks(searchQuery || 'top songs', 30),
    staleTime: 1000 * 60 * 30,
  });

  const { data: audiusTracks = [] } = useQuery({
    queryKey: ['audius-search', searchQuery],
    queryFn: () => searchAudiusTracks(searchQuery || 'top songs', 40),
    staleTime: 1000 * 60 * 20,
  });

  const { data: spotifyTracks = [] } = useQuery({
    queryKey: ['spotify-search', searchQuery, spotifyConnected],
    queryFn: () => searchSpotifyTracks(searchQuery || 'top songs', 40),
    enabled: spotifyConnected,
    staleTime: 1000 * 60 * 10,
  });

  const musicCatalog = withPopularFallback([...spotifyTracks, ...tracks, ...audiusTracks, ...streamingTracks], 20);

  const filtered = musicCatalog.filter(t => {
    const genreMatch = genre === 'all' || t.genre === genre;
    const searchValue = searchQuery.toLowerCase();
    const artistValue = artistFilter.toLowerCase();
    const albumValue = albumFilter.toLowerCase();
    const yearValue = yearFilter.trim();
    const searchMatch = !searchQuery
      || t.title?.toLowerCase().includes(searchValue)
      || t.artist_name?.toLowerCase().includes(searchValue)
      || t.album_name?.toLowerCase().includes(searchValue);
    const artistMatch = !artistFilter || t.artist_name?.toLowerCase().includes(artistValue);
    const albumMatch = !albumFilter || t.album_name?.toLowerCase().includes(albumValue);
    const yearMatch = !yearValue || String(t.release_year || '').includes(yearValue);
    return genreMatch && searchMatch && artistMatch && albumMatch && yearMatch;
  });

  const hasFilters = artistFilter || albumFilter || yearFilter || genre !== 'all';

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
        {!spotifyConnected && (
          <p className="text-xs text-primary mt-1">Free full-track streaming is powered by Audius</p>
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

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_auto] gap-3 rounded-xl border border-border bg-secondary/20 p-3">
        <Input
          value={artistFilter}
          onChange={(event) => setArtistFilter(event.target.value)}
          placeholder="Filter by author / artist"
          className="bg-background/60"
        />
        <Input
          value={albumFilter}
          onChange={(event) => setAlbumFilter(event.target.value)}
          placeholder="Filter by album or collection"
          className="bg-background/60"
        />
        <Input
          value={yearFilter}
          onChange={(event) => setYearFilter(event.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="Release year"
          inputMode="numeric"
          className="bg-background/60"
        />
        <Button
          type="button"
          variant="outline"
          disabled={!hasFilters}
          onClick={() => {
            setGenre('all');
            setArtistFilter('');
            setAlbumFilter('');
            setYearFilter('');
          }}
        >
          Clear
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} tracks found</span>
        <span>Classification: genre, artist, album/collection, release year</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(t => <TrackCard key={t.id} track={t} tracks={filtered} onAuthRequired={() => setShowAuth(true)} />)}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No tracks found</p>
          <p className="text-sm mt-1">Try a different genre or search term</p>
        </div>
      )}

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="max-w-[560px] border-0 bg-transparent p-0 shadow-none">
          <AuthPage
            embedded
            title="Sign in to save tracks"
            subtitle="Create an account or sign in to add tracks to your favorites."
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
