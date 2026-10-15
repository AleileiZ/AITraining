import type { AppData, MediaItem, Playlist } from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

export function createEmptySettings() {
  return {
    shuffle: false,
    loop: false,
    autoplay: false,
    lastPlaylistId: undefined,
    lastItemId: undefined
  };
}

export function createSeedPlaylists(now = Date.now()): Playlist[] {
  return ['音乐', '视频', '播客', '稍后收听'].map((name, index) => ({
    id: `seed-${index + 1}`,
    name,
    description: '',
    createdAt: now + index,
    itemIds: [],
    kind: 'custom' as const
  }));
}

export function createEmptyData(): AppData {
  return {
    version: CURRENT_SCHEMA_VERSION,
    playlists: createSeedPlaylists(),
    items: [],
    settings: createEmptySettings()
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function normalizeItem(raw: Record<string, unknown>): MediaItem {
  const now = Date.now();
  return {
    id: typeof raw.id === 'string' ? raw.id : `item-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: typeof raw.title === 'string' ? raw.title : '未命名内容',
    url: typeof raw.url === 'string' ? raw.url : '',
    siteName: typeof raw.siteName === 'string' ? raw.siteName : '',
    favicon: typeof raw.favicon === 'string' ? raw.favicon : undefined,
    coverUrl: typeof raw.coverUrl === 'string' ? raw.coverUrl : undefined,
    contentType: raw.contentType === 'video' || raw.contentType === 'audio' || raw.contentType === 'page' || raw.contentType === 'unknown'
      ? raw.contentType
      : 'unknown',
    addedAt: typeof raw.addedAt === 'number' ? raw.addedAt : now,
    playlistIds: Array.isArray(raw.playlistIds) ? raw.playlistIds.filter((x): x is string => typeof x === 'string') : [],
    note: typeof raw.note === 'string' ? raw.note : undefined,
    customTitle: typeof raw.customTitle === 'string' ? raw.customTitle : undefined
  };
}

function normalizePlaylist(raw: Record<string, unknown>): Playlist {
  const now = Date.now();
  return {
    id: typeof raw.id === 'string' ? raw.id : `pl-${now}-${Math.random().toString(36).slice(2, 8)}`,
    name: typeof raw.name === 'string' ? raw.name : '未命名歌单',
    description: typeof raw.description === 'string' ? raw.description : undefined,
    cover: typeof raw.cover === 'string' ? raw.cover : undefined,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    itemIds: Array.isArray(raw.itemIds) ? raw.itemIds.filter((x): x is string => typeof x === 'string') : [],
    kind: raw.kind === 'system' ? 'system' : 'custom'
  };
}

export function migrate(raw: unknown): AppData {
  if (!isRecord(raw) || !Array.isArray(raw.playlists) || !Array.isArray(raw.items)) {
    return createEmptyData();
  }
  const playlists = raw.playlists.map((p) => normalizePlaylist(isRecord(p) ? p : {}));
  const items = raw.items.map((i) => normalizeItem(isRecord(i) ? i : {}));
  const settings = isRecord(raw.settings) ? { ...createEmptySettings(), ...raw.settings } : createEmptySettings();
  const data: AppData = {
    version: CURRENT_SCHEMA_VERSION,
    playlists,
    items,
    settings
  };
  data.items.forEach((item) => {
    item.playlistIds = item.playlistIds.filter((id) => playlists.some((p) => p.id === id));
  });
  playlists.forEach((pl) => {
    pl.itemIds = pl.itemIds.filter((id) => items.some((i) => i.id === id));
  });
  return data;
}
