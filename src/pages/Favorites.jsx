import React from 'react';
import { Heart } from 'lucide-react';
import AuthPage from '@/pages/AuthPage';
import { useSonicAuth } from '@/lib/SonicAuthContext';

export default function Favorites() {
  const { isAuthenticated } = useSonicAuth();

  if (!isAuthenticated) {
    return (
      <AuthPage
        embedded
        title="Sign in to use favorites"
        subtitle="Create an account or sign in to save tracks to your liked songs."
      />
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Liked Songs</h1>
        <p className="text-sm max-w-md">Tracks you like will appear here.</p>
      </div>
    </div>
  );
}
