import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { PlayerProvider } from '@/lib/PlayerContext';
import { SonicAuthProvider, useSonicAuth } from '@/lib/SonicAuthContext';

import AppLayout from '@/components/layout/AppLayout';
import AuthPage from '@/pages/AuthPage';
import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import Albums from '@/pages/Albums';
import AlbumDetail from '@/pages/AlbumDetail';
import Artists from '@/pages/Artists';
import ArtistDetail from '@/pages/ArtistDetail';
import Playlists from '@/pages/Playlists';
import PlaylistDetail from '@/pages/PlaylistDetail';
import Favorites from '@/pages/Favorites';
import RecentlyPlayed from '@/pages/RecentlyPlayed';
import Profile from '@/pages/Profile';

const LocalApp = () => {
  const { isLoading } = useSonicAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PlayerProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/album/:id" element={<AlbumDetail />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/artist/:id" element={<ArtistDetail />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/recent" element={<RecentlyPlayed />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </PlayerProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <SonicAuthProvider>
        <Router>
          <LocalApp />
        </Router>
      </SonicAuthProvider>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
