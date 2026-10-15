import { loadData, saveData } from '../services/storage';

async function ensureInitialData(): Promise<void> {
  const result = await chrome.storage.local.get('webtune:data');
  if (result['webtune:data'] === undefined) {
    const data = await loadData();
    await saveData(data);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureInitialData();
});

chrome.runtime.onStartup.addListener(() => {
  void ensureInitialData();
});
