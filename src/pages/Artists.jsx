import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ArtistCard from '@/components/music/ArtistCard';
import { getDatabaseArtists } from '@/api/databaseMusic';

export default function Artists() {
  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists-all'],
    queryFn: () => getDatabaseArtists(50).catch(() => []),
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Artists</h1>
        <p className="text-sm text-muted-foreground">{artists.length} artists</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
      </div>

      {!isLoading && artists.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No artists yet</p>
        </div>
      )}
    </div>
  );
}
