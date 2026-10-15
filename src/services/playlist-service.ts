import type { AppData, MediaItem, Playlist } from '../types';
import { uid } from '../utils/id';

export function createPlaylist(data: AppData, name: string, description?: string): { data: AppData; playlist: Playlist } {
  const playlist: Playlist = {
    id: uid('pl'),
    name: name.trim() || '未命名歌单',
    description: description?.trim() || undefined,
    createdAt: Date.now(),
    itemIds: [],
    kind: 'custom'
  };
  return { data: { ...data, playlists: [...data.playlists, playlist] }, playlist };
}

export function updatePlaylist(data: AppData, id: string, patch: { name?: string; description?: string }): AppData {
  return {
    ...data,
    playlists: data.playlists.map((p) =>
      p.id === id
        ? {
            ...p,
            name: patch.name !== undefined ? (patch.name.trim() || p.name) : p.name,
            description: patch.description !== undefined ? (patch.description.trim() || undefined) : p.description
          }
        : p
    )
  };
}

export function deletePlaylist(data: AppData, id: string): AppData {
  const items = data.items.map((i) =>
    i.playlistIds.includes(id) ? { ...i, playlistIds: i.playlistIds.filter((pid) => pid !== id) } : i
  );
  return { ...data, playlists: data.playlists.filter((p) => p.id !== id), items };
}

function itemUrlOf(data: AppData, itemId: string): string {
  const item = data.items.find((i) => i.id === itemId);
  return item ? item.url : '';
}

export function addItemToPlaylist(data: AppData, itemId: string, playlistId: string): AppData {
  const playlist = data.playlists.find((p) => p.id === playlistId);
  if (!playlist || playlist.itemIds.includes(itemId)) return data;
  const url = itemUrlOf(data, itemId);
  const alreadyHasUrl = playlist.itemIds.some((id) => {
    const other = data.items.find((i) => i.id === id);
    return other && other.url === url;
  });
  if (alreadyHasUrl) return data;
  const playlists = data.playlists.map((p) => (p.id === playlistId ? { ...p, itemIds: [...p.itemIds, itemId] } : p));
  const items = data.items.map((i) => (i.id === itemId && !i.playlistIds.includes(playlistId) ? { ...i, playlistIds: [...i.playlistIds, playlistId] } : i));
  return { ...data, playlists, items };
}

export function addItemToPlaylists(data: AppData, itemId: string, playlistIds: string[]): AppData {
  let next = data;
  for (const id of playlistIds) {
    next = addItemToPlaylist(next, itemId, id);
  }
  return next;
}

export function removeItemFromPlaylist(data: AppData, itemId: string, playlistId: string): AppData {
  const playlists = data.playlists.map((p) => (p.id === playlistId ? { ...p, itemIds: p.itemIds.filter((id) => id !== itemId) } : p));
  const items = data.items.map((i) => (i.id === itemId ? { ...i, playlistIds: i.playlistIds.filter((pid) => pid !== playlistId) } : i));
  return { ...data, playlists, items };
}

export function deleteItem(data: AppData, itemId: string): AppData {
  const playlists = data.playlists.map((p) => ({ ...p, itemIds: p.itemIds.filter((id) => id !== itemId) }));
  return { ...data, playlists, items: data.items.filter((i) => i.id !== itemId) };
}

export function updateItem(data: AppData, itemId: string, patch: Partial<Pick<MediaItem, 'title' | 'customTitle' | 'note' | 'contentType' | 'coverUrl' | 'favicon'>>): AppData {
  return {
    ...data,
    items: data.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i))
  };
}
