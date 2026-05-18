import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, ListMusic, Music2, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import AuthPage from '@/pages/AuthPage';
import { useSonicAuth } from '@/lib/SonicAuthContext';
import { getFavoriteTracks } from '@/api/favorites';
import { getDatabasePlaylists } from '@/api/databaseMusic';

export default function Profile() {
  const { user, isAuthenticated } = useSonicAuth();

  const { data: favoriteTracks = [] } = useQuery({
    queryKey: ['favorite-tracks'],
    queryFn: getFavoriteTracks,
    enabled: isAuthenticated,
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['profile-playlists'],
    queryFn: () => getDatabasePlaylists(50),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <AuthPage
        embedded
        title="Sign in to SonicFlow"
        subtitle="Create an account or sign in to manage your profile, playlists, and library."
      />
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-white" />
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Profile</p>
          <h1 className="text-3xl font-extrabold">{user?.display_name || 'Music Lover'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{user?.email || ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="glass p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favoriteTracks.length}</p>
              <p className="text-xs text-muted-foreground">Liked Songs</p>
            </div>
          </div>
        </Card>
        <Card className="glass p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{playlists.length}</p>
              <p className="text-xs text-muted-foreground">Playlists</p>
            </div>
          </div>
        </Card>
        <Card className="glass p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">-</p>
              <p className="text-xs text-muted-foreground">Hours Listened</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/favorites" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-all flex items-center gap-3">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-medium">My Liked Songs</span>
          </Link>
          <Link to="/playlists" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-all flex items-center gap-3">
            <ListMusic className="w-5 h-5 text-primary" />
            <span className="font-medium">My Playlists</span>
          </Link>
          <Link to="/recent" className="glass rounded-xl p-4 hover:bg-secondary/60 transition-all flex items-center gap-3">
            <Music2 className="w-5 h-5 text-primary" />
            <span className="font-medium">Recently Played</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
