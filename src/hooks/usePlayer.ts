import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppData, MediaItem, PlayerState } from '../types';
import { resolveQueueIds } from '../utils/library';

export interface PlayerActions {
  state: PlayerState;
  currentItem: MediaItem | null;
  playItem: (itemId: string, playlistId?: string) => void;
  playAndOpen: (itemId: string, playlistId?: string) => void;
  next: () => void;
  prev: () => void;
  openCurrent: () => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
}

type MutateFn = (fn: (d: AppData) => AppData) => Promise<void>;

const EMPTY_STATE: PlayerState = {
  currentItemId: null,
  playlistId: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  canPlayInline: false
};

export function usePlayer(data: AppData | null, mutate: MutateFn): PlayerActions {
  const [state, setState] = useState<PlayerState>(EMPTY_STATE);

  useEffect(() => {
    if (!data) return;
    const lastId = data.settings.lastItemId;
    if (lastId && data.items.some((i) => i.id === lastId)) {
      const plId = data.settings.lastPlaylistId ?? null;
      const queue = resolveQueueIds(data, plId);
      const idx = queue.indexOf(lastId);
      setState((s) => ({
        ...s,
        currentItemId: lastId,
        playlistId: plId,
        queue,
        queueIndex: idx >= 0 ? idx : 0
      }));
    }
  }, [data]);

  const currentItem = useMemo(() => {
    if (!data || !state.currentItemId) return null;
    return data.items.find((i) => i.id === state.currentItemId) ?? null;
  }, [data, state.currentItemId]);

  const persist = useCallback(
    (itemId: string, playlistId: string | null) => {
      void mutate((d) => ({
        ...d,
        settings: { ...d.settings, lastItemId: itemId, lastPlaylistId: playlistId ?? undefined }
      }));
    },
    [mutate]
  );

  const playItem = useCallback(
    (itemId: string, playlistId?: string) => {
      if (!data) return;
      const plId = playlistId ?? state.playlistId ?? null;
      const queue = resolveQueueIds(data, plId);
      const idx = Math.max(0, queue.indexOf(itemId));
      setState((s) => ({ ...s, currentItemId: itemId, playlistId: plId, queue, queueIndex: idx }));
      persist(itemId, plId);
    },
    [data, state.playlistId, persist]
  );

  const playAndOpen = useCallback(
    (itemId: string, playlistId?: string) => {
      if (!data) return;
      const item = data.items.find((i) => i.id === itemId);
      if (!item) return;
      const plId = playlistId ?? state.playlistId ?? null;
      const queue = resolveQueueIds(data, plId);
      const idx = Math.max(0, queue.indexOf(itemId));
      setState((s) => ({ ...s, currentItemId: itemId, playlistId: plId, queue, queueIndex: idx, isPlaying: true }));
      persist(itemId, plId);
      void chrome.tabs.create({ url: item.url });
    },
    [data, state.playlistId, persist]
  );

  const moveBy = useCallback(
    (delta: number) => {
      if (!data || state.queue.length === 0 || state.queueIndex < 0) return;
      const len = state.queue.length;
      const loop = data.settings.loop;
      const shuffle = data.settings.shuffle;
      let idx = state.queueIndex;
      if (shuffle && len > 1) {
        let next = idx;
        while (next === idx) next = Math.floor(Math.random() * len);
        idx = next;
      } else {
        idx = idx + delta;
        if (idx >= len) idx = loop ? 0 : len - 1;
        if (idx < 0) idx = loop ? len - 1 : 0;
      }
      const itemId = state.queue[idx];
      setState((s) => ({ ...s, currentItemId: itemId, queueIndex: idx }));
      persist(itemId, state.playlistId);
    },
    [data, state.queue, state.queueIndex, state.playlistId, persist]
  );

  const next = useCallback(() => moveBy(1), [moveBy]);
  const prev = useCallback(() => moveBy(-1), [moveBy]);

  const openCurrent = useCallback(() => {
    if (!currentItem) return;
    void chrome.tabs.create({ url: currentItem.url });
    setState((s) => ({ ...s, isPlaying: true }));
  }, [currentItem]);

  const toggleShuffle = useCallback(() => {
    void mutate((d) => ({ ...d, settings: { ...d.settings, shuffle: !d.settings.shuffle } }));
  }, [mutate]);

  const toggleLoop = useCallback(() => {
    void mutate((d) => ({ ...d, settings: { ...d.settings, loop: !d.settings.loop } }));
  }, [mutate]);

  return { state, currentItem, playItem, playAndOpen, next, prev, openCurrent, toggleShuffle, toggleLoop };
}
