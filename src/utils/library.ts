import type { AppData, MediaItem } from '../types';

export function isVirtualPlaylist(id: string): boolean {
  return id === 'all' || id === 'recent' || id === 'my';
}

export function resolvePlaylistItems(data: AppData, playlistId: string): MediaItem[] {
  if (playlistId === 'all') return [...data.items];
  if (playlistId === 'recent') return [...data.items].sort((a, b) => b.addedAt - a.addedAt);
  if (playlistId === 'my') return [];
  const playlist = data.playlists.find((p) => p.id === playlistId);
  if (!playlist) return [];
  return playlist.itemIds
    .map((id) => data.items.find((i) => i.id === id))
    .filter((i): i is MediaItem => i !== undefined);
}

export function resolveQueueIds(data: AppData, playlistId: string | null): string[] {
  if (!playlistId) return data.items.map((i) => i.id);
  return resolvePlaylistItems(data, playlistId).map((i) => i.id);
}
