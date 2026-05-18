import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getDatabasePlaylists } from '@/api/databaseMusic';
import AuthPage from '@/pages/AuthPage';
import { useSonicAuth } from '@/lib/SonicAuthContext';

export default function Playlists() {
  const params = new URLSearchParams(window.location.search);
  const [showCreate, setShowCreate] = useState(params.get('create') === 'true');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSonicAuth();

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists-all'],
    queryFn: () => getDatabasePlaylists(50).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      throw new Error('Playlist creation is not connected in local mode yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists-all'] });
      queryClient.invalidateQueries({ queryKey: ['playlists-sidebar'] });
      setShowCreate(false);
      setName('');
      setDescription('');
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Playlists</h1>
          <p className="text-sm text-muted-foreground">{playlists.length} playlists</p>
        </div>
        <Button className="rounded-full gap-2 bg-primary hover:bg-primary/90" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> New Playlist
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {playlists.map(pl => (
          <Link key={pl.id} to={`/playlist/${pl.id}`} className="group rounded-xl bg-secondary/40 hover:bg-secondary/70 p-3 transition-all duration-300">
            <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              {pl.cover_url ? (
                <img src={pl.cover_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <ListMusic className="w-12 h-12 text-primary/40" />
              )}
            </div>
            <p className="text-sm font-semibold truncate">{pl.name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{pl.tracks_count ?? pl.track_ids?.length ?? 0} tracks</p>
          </Link>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <ListMusic className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-lg font-medium">No playlists yet</p>
          <p className="text-sm mt-1">Create your first playlist</p>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          {!isAuthenticated ? (
            <AuthPage
              embedded
              title="Sign in to create playlists"
              subtitle="Create an account or sign in to save your own SonicFlow playlists."
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Playlist name" value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50" />
                <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary/50" />
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!name.trim() || createMutation.isPending}
                  onClick={() => createMutation.mutate({ name: name.trim(), description: description.trim(), track_ids: [] })}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
