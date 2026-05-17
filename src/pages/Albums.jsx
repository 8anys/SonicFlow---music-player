import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AlbumCard from '@/components/music/AlbumCard';
import { getDatabaseAlbums } from '@/api/databaseMusic';

export default function Albums() {
  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['albums-all'],
    queryFn: () => getDatabaseAlbums(50).catch(() => []),
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Albums</h1>
        <p className="text-sm text-muted-foreground">{albums.length} albums</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albums.map(a => <AlbumCard key={a.id} album={a} />)}
      </div>

      {!isLoading && albums.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-medium">No albums yet</p>
        </div>
      )}
    </div>
  );
}
