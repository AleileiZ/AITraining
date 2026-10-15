export type ContentType = 'video' | 'audio' | 'page' | 'unknown';

export type PlaylistKind = 'system' | 'custom';

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  siteName: string;
  favicon?: string;
  coverUrl?: string;
  contentType: ContentType;
  addedAt: number;
  playlistIds: string[];
  note?: string;
  customTitle?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  createdAt: number;
  itemIds: string[];
  kind: PlaylistKind;
}

export interface Settings {
  shuffle: boolean;
  loop: boolean;
  autoplay: boolean;
  lastPlaylistId?: string;
  lastItemId?: string;
}

export interface AppData {
  version: number;
  playlists: Playlist[];
  items: MediaItem[];
  settings: Settings;
}

export const SYSTEM_PLAYLIST_ID = 'all';

export interface DetectedMedia {
  kind: 'video' | 'audio';
  src: string;
  title?: string;
  poster?: string;
  duration?: number;
}

export interface DetectedMediaInfo {
  title: string;
  url: string;
  siteName: string;
  favicon: string | null;
  coverUrl: string | null;
  media: DetectedMedia | null;
}

export interface PlayerState {
  currentItemId: string | null;
  playlistId: string | null;
  queue: string[];
  queueIndex: number;
  isPlaying: boolean;
  canPlayInline: boolean;
}
