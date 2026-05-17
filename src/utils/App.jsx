import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { PlayerProvider } from '@/lib/PlayerContext';

import AppLayout from '@/components/layout/AppLayout';
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
      <Router>
        <LocalApp />
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
