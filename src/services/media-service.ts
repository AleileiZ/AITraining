import type { AppData, ContentType, DetectedMediaInfo, MediaItem } from '../types';
import { uid } from '../utils/id';
import { siteNameFromUrl } from '../utils/url';

export type CollectStatus = 'created' | 'added' | 'duplicate';

export function inferContentType(info: DetectedMediaInfo | null): ContentType {
  if (info && info.media) return info.media.kind;
  return 'page';
}

export function createMediaItem(data: AppData, info: DetectedMediaInfo, playlistId: string | null): { data: AppData; item: MediaItem; status: CollectStatus } {
  const existing = data.items.find((i) => i.url === info.url);
  if (existing) {
    if (playlistId && existing.playlistIds.includes(playlistId)) {
      return { data, item: existing, status: 'duplicate' };
    }
    if (playlistId) {
      const item = { ...existing, playlistIds: [...existing.playlistIds, playlistId] };
      const playlists = data.playlists.map((p) => (p.id === playlistId && !p.itemIds.includes(item.id) ? { ...p, itemIds: [...p.itemIds, item.id] } : p));
      return { data: { ...data, items: data.items.map((i) => (i.id === item.id ? item : i)), playlists }, item, status: 'added' };
    }
    return { data, item: existing, status: 'duplicate' };
  }

  const item: MediaItem = {
    id: uid('item'),
    title: (info.media && info.media.title) || info.title,
    url: info.url,
    siteName: info.siteName || siteNameFromUrl(info.url),
    favicon: info.favicon || undefined,
    coverUrl: info.coverUrl || undefined,
    contentType: inferContentType(info),
    addedAt: Date.now(),
    playlistIds: playlistId ? [playlistId] : [],
    note: undefined,
    customTitle: undefined
  };
  let playlists = data.playlists;
  if (playlistId) {
    playlists = playlists.map((p) => (p.id === playlistId ? { ...p, itemIds: [...p.itemIds, item.id] } : p));
  }
  return { data: { ...data, items: [...data.items, item], playlists }, item, status: 'created' };
}
