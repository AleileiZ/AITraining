import type { AppData } from '../types';
import { migrate, CURRENT_SCHEMA_VERSION } from './migration';

const BACKUP_MARK = 'webtune-backup';

export function serializeBackup(data: AppData): string {
  return JSON.stringify({ app: BACKUP_MARK, version: CURRENT_SCHEMA_VERSION, exportedAt: new Date().toISOString(), data }, null, 2);
}

export function parseBackup(text: string): AppData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('不是有效的 JSON 文件');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('文件内容不是合法的数据结构');
  }
  const rec = parsed as Record<string, unknown>;
  if (rec.app === BACKUP_MARK && rec.data !== undefined) {
    parsed = rec.data;
  }
  const check = parsed as Record<string, unknown>;
  if (!Array.isArray(check.playlists) || !Array.isArray(check.items)) {
    throw new Error('文件格式不正确：缺少歌单或收藏数据');
  }
  return migrate(parsed);
}

export function downloadBackup(data: AppData, filename = `webtune-backup-${new Date().toISOString().slice(0, 10)}.json`): void {
  const blob = new Blob([serializeBackup(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
