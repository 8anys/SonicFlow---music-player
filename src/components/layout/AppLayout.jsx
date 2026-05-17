import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MusicPlayer from './MusicPlayer';
import { usePlayer } from '@/lib/PlayerContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentTrack } = usePlayer();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setMobileOpen(true)} />
        <main className={`flex-1 overflow-y-auto ${currentTrack ? 'pb-24' : 'pb-4'}`}>
          <Outlet />
        </main>
      </div>

      {/* Player */}
      <MusicPlayer />
    </div>
  );
}