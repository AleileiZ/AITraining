import { createContext, useContext } from 'react';
import type { AppData } from '../types';
import type { PlaylistActions } from './usePlaylists';
import type { PlayerActions } from './usePlayer';

export interface AppContextValue {
  data: AppData | null;
  ready: boolean;
  mutate: (fn: (d: AppData) => AppData) => Promise<void>;
  playlists: PlaylistActions;
  player: PlayerActions;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp 必须在 AppContext.Provider 内使用');
  return ctx;
}
