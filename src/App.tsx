import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MiniPlayer from './components/MiniPlayer';
import HomePage from './pages/HomePage';
import PlaylistPage from './pages/PlaylistPage';
import SettingsPage from './pages/SettingsPage';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { AppContext } from './hooks/useApp';
import { useAppData } from './hooks/useAppData';
import { usePlaylists } from './hooks/usePlaylists';
import { usePlayer } from './hooks/usePlayer';

export type View =
  | { name: 'home' }
  | { name: 'playlist'; playlistId: string }
  | { name: 'settings' };

export default function App() {
  const { data, ready, mutate } = useAppData();
  const playlists = usePlaylists(data, mutate);
  const player = usePlayer(data, mutate);
  const [view, setView] = useState<View>({ name: 'home' });
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AppContext.Provider value={{ data, ready, mutate, playlists, player }}>
      <div className="app">
        <Sidebar view={view} onNavigate={setView} onCreatePlaylist={() => setCreateOpen(true)} />
        <main className="app-content">
          {ready && view.name === 'home' && <HomePage onNavigate={setView} />}
          {ready && view.name === 'playlist' && <PlaylistPage playlistId={view.playlistId} onNavigate={setView} />}
          {ready && view.name === 'settings' && <SettingsPage />}
        </main>
        <MiniPlayer />
        {createOpen && (
          <CreatePlaylistModal
            onClose={() => setCreateOpen(false)}
            onCreate={(name, desc) => {
              playlists.create(name, desc);
              setCreateOpen(false);
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}
