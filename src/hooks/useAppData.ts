import { useCallback, useEffect, useState } from 'react';
import type { AppData } from '../types';
import { loadData, saveData, subscribe } from '../services/storage';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadData().then((d) => {
      if (!alive) return;
      setData(d);
      setReady(true);
    });
    const unsub = subscribe((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const mutate = useCallback(async (fn: (d: AppData) => AppData) => {
    const current = await loadData();
    const next = fn(current);
    if (next !== current) {
      await saveData(next);
    }
    setData(next);
  }, []);

  return { data, ready, mutate };
}
