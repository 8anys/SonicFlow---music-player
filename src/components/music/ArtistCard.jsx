import React from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';

export default function ArtistCard({ artist }) {
  if (!artist) return null;

  return (
    <Link to={`/artist/${artist.id}`} className="group relative rounded-xl bg-secondary/40 hover:bg-secondary/70 p-3 transition-all duration-300 cursor-pointer min-w-[150px]">
      <div className="relative aspect-square rounded-full overflow-hidden mb-3 bg-secondary">
        {artist.image_url ? (
          <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
            <UserRound className="w-10 h-10 text-primary/60" />
          </div>
        )}
      </div>
      <p className="text-sm font-semibold truncate text-center">{artist.name}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5 text-center">
        {artist.followers ? `${artist.followers.toLocaleString()} followers` : 'Artist'}
      </p>
    </Link>
  );
}
