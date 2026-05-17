import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlayer } from '@/lib/PlayerContext';
import { Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrackRow from '@/components/music/TrackRow';

export default function RecentlyPlayed() {
  const { playTrack } = usePlayer();

  const { data: recent = [] } = useQuery({
    queryKey: ['recent-plays'],
    queryFn: () => base44.entities.RecentPlay.list('-created_date', 50),
  });

  const { data: allTracks = [] } = useQuery({
    queryKey: ['all-tracks-recent'],
    queryFn: () => base44.entities.Track.list('-created_date', 200),
  });

  const tracks = recent.map(r => allTracks.find(t => t.id === r.track_id)).filter(Boolean);
  // Remove duplicates
  const uniqueTracks = [...new Map(tracks.map(t => [t.id, t])).values()];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Recently Played</h1>
          <p className="text-sm text-muted-foreground">{uniqueTracks.length} tracks</p>
        </div>
        {uniqueTracks.length > 0 && (
          <Button
            className="rounded-full gap-2 bg-primary hover:bg-primary/90"
            onClick={() => playTrack(uniqueTracks[0], uniqueTracks)}
          >
            <Play className="w-4 h-4" /> Play All
          </Button>
        )}
      </div>

      {uniqueTracks.length > 0 && (
        <div className="space-y-0.5">
          {uniqueTracks.map((t, i) => <TrackRow key={t.id} track={t} index={i} tracks={uniqueTracks} />)}
        </div>
      )}

      {uniqueTracks.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-lg font-medium">No recent plays</p>
          <p className="text-sm mt-1">Tracks you listen to will appear here</p>
        </div>
      )}
    </div>
  );
}