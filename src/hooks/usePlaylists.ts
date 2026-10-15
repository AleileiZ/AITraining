import { useMemo } from 'react';
import type { AppData, MediaItem, Playlist } from '../types';
import {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addItemToPlaylist,
  addItemToPlaylists,
  removeItemFromPlaylist,
  deleteItem,
  updateItem
} from '../services/playlist-service';

export type ItemPatch = Partial<Pick<MediaItem, 'title' | 'customTitle' | 'note' | 'contentType' | 'coverUrl' | 'favicon'>>;

export interface PlaylistActions {
  custom: Playlist[];
  get: (id: string) => Playlist | null;
  create: (name: string, description?: string) => void;
  update: (id: string, patch: { name?: string; description?: string }) => void;
  remove: (id: string) => void;
  addItem: (itemId: string, playlistId: string) => void;
  addItemToMany: (itemId: string, playlistIds: string[]) => void;
  removeItem: (itemId: string, playlistId: string) => void;
  deleteItem: (itemId: string) => void;
  updateItem: (itemId: string, patch: ItemPatch) => void;
}

type MutateFn = (fn: (d: AppData) => AppData) => Promise<void>;

export function usePlaylists(data: AppData | null, mutate: MutateFn): PlaylistActions {
  return useMemo(() => {
    const custom = data ? data.playlists.filter((p) => p.kind === 'custom') : [];
    const get = (id: string) => (data ? data.playlists.find((p) => p.id === id) ?? null : null);
    return {
      custom,
      get,
      create: (name, description) => void mutate((d) => createPlaylist(d, name, description).data),
      update: (id, patch) => void mutate((d) => updatePlaylist(d, id, patch)),
      remove: (id) => void mutate((d) => deletePlaylist(d, id)),
      addItem: (itemId, playlistId) => void mutate((d) => addItemToPlaylist(d, itemId, playlistId)),
      addItemToMany: (itemId, playlistIds) => void mutate((d) => addItemToPlaylists(d, itemId, playlistIds)),
      removeItem: (itemId, playlistId) => void mutate((d) => removeItemFromPlaylist(d, itemId, playlistId)),
      deleteItem: (itemId) => void mutate((d) => deleteItem(d, itemId)),
      updateItem: (itemId, patch) => void mutate((d) => updateItem(d, itemId, patch))
    };
  }, [data, mutate]);
}
