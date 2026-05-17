import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, Menu, User, Music2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { usePlayer } from '@/lib/PlayerContext';

export default function TopBar({ onMenuToggle }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { spotifyConnected, spotifyConfigured, loginSpotify, logoutSpotify } = usePlayer();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/discover?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="h-16 glass-strong flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={onMenuToggle}>
          <Menu className="w-5 h-5" />
        </Button>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-56 md:w-80 pl-10 bg-secondary/50 border-border/50 h-10 text-sm placeholder:text-muted-foreground/50 focus:bg-secondary"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        {spotifyConfigured && (
          <Button
            variant={spotifyConnected ? 'secondary' : 'outline'}
            size="sm"
            className="hidden sm:inline-flex gap-2"
            onClick={spotifyConnected ? logoutSpotify : loginSpotify}
          >
            <Music2 className="w-4 h-4" />
            {spotifyConnected ? 'Spotify On' : 'Connect Spotify'}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="w-[18px] h-[18px]" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/profile')}>
          <Settings className="w-[18px] h-[18px]" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-gradient-to-br from-purple-500 to-blue-500 w-8 h-8 hover:opacity-90">
              <User className="w-4 h-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/favorites">My Favorites</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/playlists">My Playlists</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground">Local mode</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
