import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Disc3, Users, ListMusic, Heart, Clock, Plus, Music2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: Disc3, label: 'Albums', path: '/albums' },
  { icon: Users, label: 'Artists', path: '/artists' },
  { icon: ListMusic, label: 'Playlists', path: '/playlists' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
  { icon: Clock, label: 'Recently Played', path: '/recent' },
];

export default function Sidebar({ className = '' }) {
  const location = useLocation();

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists-sidebar'],
    queryFn: () => base44.entities.Playlist.list('-created_date', 10),
  });

  return (
    <aside className={`w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full ${className}`}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Music2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">Melodify</span>
      </div>

      <ScrollArea className="flex-1 px-3">
        {/* Main Nav */}
        <div className="mb-6">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Menu</p>
          <nav className="space-y-0.5">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-primary' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Library */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Your Library</p>
            <Link to="/playlists?create=true">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-0.5">
            {playlists.map(pl => (
              <Link
                key={pl.id}
                to={`/playlist/${pl.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              >
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <ListMusic className="w-4 h-4 text-primary/70" />
                </div>
                <span className="truncate">{pl.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}