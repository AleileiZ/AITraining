import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MiniPlayer from './components/MiniPlayer';
import HomePage from './pages/HomePage';
import PlaylistPage from './pages/PlaylistPage';
import SettingsPage from './pages/SettingsPage';

export type View =
  | { name: 'home' }
  | { name: 'playlist'; playlistId: string }
  | { name: 'settings' };

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' });

  return (
    <div className="app">
      <Sidebar view={view} onNavigate={setView} />
      <main className="app-content">
        {view.name === 'home' && <HomePage />}
        {view.name === 'playlist' && <PlaylistPage playlistId={view.playlistId} />}
        {view.name === 'settings' && <SettingsPage />}
      </main>
      <MiniPlayer />
    </div>
  );
}
