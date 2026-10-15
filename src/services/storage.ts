import type { AppData } from '../types';
import { createEmptyData } from './migration';
import { migrate, CURRENT_SCHEMA_VERSION } from './migration';

const DATA_KEY = 'webtune:data';

let cached: AppData | null = null;

export async function loadData(): Promise<AppData> {
  if (cached) return cached;
  const result = await chrome.storage.local.get(DATA_KEY);
  const raw = result[DATA_KEY];
  const data = raw === undefined ? createEmptyData() : migrate(raw);
  data.version = CURRENT_SCHEMA_VERSION;
  cached = data;
  return data;
}

export async function saveData(data: AppData): Promise<void> {
  cached = data;
  await chrome.storage.local.set({ [DATA_KEY]: data });
}

export async function resetCache(): Promise<void> {
  cached = null;
}

export function subscribe(listener: (data: AppData) => void): () => void {
  const handler = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area !== 'local') return;
    const change = changes[DATA_KEY];
    if (!change || change.newValue === undefined) return;
    cached = migrate(change.newValue);
    cached.version = CURRENT_SCHEMA_VERSION;
    listener(cached);
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
