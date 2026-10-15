import type { AppData } from '../types';
import { createEmptyData } from './migration';
import { migrate, CURRENT_SCHEMA_VERSION } from './migration';

const DATA_KEY = 'webtune:data';

let cached: AppData | null = null;

// 浏览器扩展环境用 chrome.storage.local；非扩展环境（如 GitHub Pages 网页版）降级到 localStorage
const hasChromeStorage =
  typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;

async function readRaw(): Promise<unknown> {
  if (hasChromeStorage) {
    const result = await chrome.storage.local.get(DATA_KEY);
    return result[DATA_KEY];
  }
  const text = localStorage.getItem(DATA_KEY);
  return text === null ? undefined : JSON.parse(text);
}

async function writeRaw(value: unknown): Promise<void> {
  if (hasChromeStorage) {
    await chrome.storage.local.set({ [DATA_KEY]: value });
    return;
  }
  localStorage.setItem(DATA_KEY, JSON.stringify(value));
}

export async function loadData(): Promise<AppData> {
  if (cached) return cached;
  const raw = await readRaw();
  const data = raw === undefined || raw === null ? createEmptyData() : migrate(raw);
  data.version = CURRENT_SCHEMA_VERSION;
  cached = data;
  return data;
}

export async function saveData(data: AppData): Promise<void> {
  cached = data;
  await writeRaw(data);
}

export async function resetCache(): Promise<void> {
  cached = null;
}

export function subscribe(listener: (data: AppData) => void): () => void {
  if (hasChromeStorage) {
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
  // 网页环境：监听跨标签页的 storage 事件
  const handler = (e: StorageEvent) => {
    if (e.key !== DATA_KEY || e.newValue === null) return;
    try {
      cached = migrate(JSON.parse(e.newValue));
      cached.version = CURRENT_SCHEMA_VERSION;
      listener(cached);
    } catch {
      /* 忽略非法数据 */
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
