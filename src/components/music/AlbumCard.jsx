import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function AlbumCard({ album }) {
  return (
    <Link to={`/album/${album.id}`} className="group relative rounded-xl bg-secondary/40 hover:bg-secondary/70 p-3 transition-all duration-300 cursor-pointer">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-secondary">
        {album.cover_url ? (
          <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30" />
        )}
        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
        </div>
      </div>
      <p className="text-sm font-semibold truncate">{album.title}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{album.artist_name}{album.release_year ? ` · ${album.release_year}` : ''}</p>
    </Link>
  );
}
