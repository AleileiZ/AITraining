import { useMemo } from 'react';
import type { AppData, ContentType } from '../types';

export type SortKey = 'added' | 'title' | 'site';
export type TypeFilter = ContentType | 'all';

export function useMediaLibrary(data: AppData | null, query: string, typeFilter: TypeFilter, sortBy: SortKey) {
  return useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    let items = data.items.filter((i) => {
      if (typeFilter !== 'all' && i.contentType !== typeFilter) return false;
      if (!q) return true;
      const title = (i.customTitle || i.title).toLowerCase();
      const inPlaylistNamed = data.playlists.some((p) => i.playlistIds.includes(p.id) && p.name.toLowerCase().includes(q));
      return title.includes(q) || i.siteName.toLowerCase().includes(q) || i.url.toLowerCase().includes(q) || inPlaylistNamed;
    });
    items = [...items].sort((a, b) => {
      if (sortBy === 'title') return (a.customTitle || a.title).localeCompare(b.customTitle || b.title, 'zh');
      if (sortBy === 'site') return a.siteName.localeCompare(b.siteName, 'zh');
      return b.addedAt - a.addedAt;
    });
    return items;
  }, [data, query, typeFilter, sortBy]);
}
