import { useEffect, useState } from 'react';
import { ExternalLink, Check, Loader2, Plus, Monitor, Film, Music2, Globe, ArrowLeft } from 'lucide-react';
import { loadData, saveData } from '../services/storage';
import { createMediaItem } from '../services/media-service';
import { createPlaylist } from '../services/playlist-service';
import { detectMediaInfo, type DetectedMediaInfo } from '../content/media-detector';
import { siteNameFromUrl } from '../utils/url';
import type { AppData } from '../types';
import './popup.css';

interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

type Step = 'loading' | 'ready' | 'pick' | 'done' | 'error';

function readDetected(): unknown {
  return (window as unknown as Record<string, unknown>).__WEBTUNE_DETECTED__ ?? null;
}

export default function Popup() {
  const [tab, setTab] = useState<TabInfo | null>(null);
  const [detected, setDetected] = useState<DetectedMediaInfo | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [tabs, stored] = await Promise.all([
        chrome.tabs.query({ active: true, currentWindow: true }),
        loadData()
      ]);
      if (!alive) return;
      setData(stored);
      const t = tabs[0];
      if (t && t.id !== undefined && t.url) {
        const info: TabInfo = { id: t.id, title: t.title || '未命名页面', url: t.url, favIconUrl: t.favIconUrl };
        setTab(info);
        setStep('ready');
        await detect(info);
      } else {
        setStep('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function detect(info: TabInfo) {
    setDetecting(true);
    setNote(null);
    try {
      const res = await chrome.scripting.executeScript({ target: { tabId: info.id }, func: detectMediaInfo });
      const result = res[0]?.result as DetectedMediaInfo | undefined;
      if (result && result.url) {
        setDetected({ ...result, title: result.title || info.title });
      } else {
        setNote('未检测到视频或音频，将按普通网页收藏');
      }
    } catch {
      try {
        await chrome.scripting.executeScript({ target: { tabId: info.id }, files: ['content/media-detector.js'] });
        const res2 = await chrome.scripting.executeScript({ target: { tabId: info.id }, func: readDetected });
        const result = res2[0]?.result as DetectedMediaInfo | undefined;
        if (result && result.url) {
          setDetected({ ...result, title: result.title || info.title });
        } else {
          setNote('未检测到视频或音频，将按普通网页收藏');
        }
      } catch {
        setNote('该页面不允许注入脚本，将按普通网页收藏');
      }
    } finally {
      setDetecting(false);
    }
  }

  function fallbackInfo(info: TabInfo): DetectedMediaInfo {
    return { title: info.title, url: info.url, siteName: siteNameFromUrl(info.url), favicon: null, coverUrl: null, media: null };
  }

  async function collect(playlistId: string | null) {
    if (!tab || !data || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const source = detected ?? fallbackInfo(tab);
      const { data: next, status } = createMediaItem(data, source, playlistId);
      await saveData(next);
      setData(next);
      setStep('done');
      setMessage({ ok: true, text: status === 'duplicate' ? '该内容已存在于这个歌单' : '收藏成功' });
    } catch {
      setMessage({ ok: false, text: '保存失败，请重试' });
    } finally {
      setBusy(false);
    }
  }

  async function createAndCollect() {
    if (!data || !newName.trim() || busy) return;
    setBusy(true);
    const { data: next, playlist } = createPlaylist(data, newName.trim());
    await saveData(next);
    setData(next);
    setNewName('');
    setBusy(false);
    await collect(playlist.id);
  }

  const openFullPage = () => {
    void chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  };

  const mediaBadge = detected?.media ? (
    detected.media.kind === 'video' ? <Film size={14} /> : <Music2 size={14} />
  ) : (
    <Globe size={14} />
  );
  const mediaText = detected?.media
    ? detected.media.kind === 'video'
      ? '检测到视频内容'
      : '检测到音频内容'
    : note ?? '未检测到媒体，按普通网页收藏';

  return (
    <div className="popup">
      <header className="popup-header">
        <div className="popup-brand">
          <span className="popup-logo">♪</span>
          <span>WebTune</span>
        </div>
        <button className="icon-btn" title="打开完整页面" onClick={openFullPage}>
          <ExternalLink size={16} />
        </button>
      </header>

      <section className="popup-body">
        {step === 'loading' && (
          <div className="popup-center">
            <Loader2 size={22} className="spin" />
            <span>正在读取页面…</span>
          </div>
        )}

        {step === 'error' && (
          <div className="popup-center">
            <span>无法读取当前标签页</span>
          </div>
        )}

        {step === 'ready' && tab && (
          <>
            <div className="tab-card">
              <div className="tab-main">
                <div className="tab-title" title={tab.title}>{tab.title}</div>
                <div className="tab-url" title={tab.url}>{tab.url}</div>
              </div>
              {tab.favIconUrl && <img className="tab-favicon" src={tab.favIconUrl} alt="" />}
            </div>
            <div className={`media-line${detected?.media ? ' has-media' : ''}`}>
              {detecting ? <Loader2 size={14} className="spin" /> : mediaBadge}
              <span>{detecting ? '正在检测媒体…' : mediaText}</span>
            </div>
            {detected?.coverUrl && <img className="popup-cover" src={detected.coverUrl} alt="" />}
            <button className="btn btn-primary popup-main-btn" disabled={busy} onClick={() => setStep('pick')}>
              <Plus size={16} />
              收藏到歌单
            </button>
          </>
        )}

        {step === 'pick' && data && (
          <>
            <div className="pick-head">
              <button className="icon-btn" title="返回" onClick={() => setStep('ready')}>
                <ArrowLeft size={16} />
              </button>
              <span>选择歌单</span>
            </div>
            <div className="pick-list">
              {data.playlists.filter((p) => p.kind === 'custom').map((p) => (
                <button key={p.id} className="pick-row" disabled={busy} onClick={() => void collect(p.id)}>
                  <span className="pick-name">{p.name}</span>
                  <span className="pick-count">{p.itemIds.length}</span>
                </button>
              ))}
            </div>
            <div className="pick-new">
              <input
                className="input"
                placeholder="新建歌单名称"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void createAndCollect()}
              />
              <button className="btn btn-primary" disabled={!newName.trim() || busy} onClick={() => void createAndCollect()}>
                新建并收藏
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="done-view">
            <span className="done-icon"><Check size={26} /></span>
            <div className="done-text">{message?.text ?? '收藏成功'}</div>
            <div className="done-actions">
              <button className="btn btn-primary" onClick={openFullPage}>
                <ExternalLink size={15} />
                打开完整页面
              </button>
              <button className="btn btn-ghost" onClick={() => window.close()}>完成</button>
            </div>
            <button className="done-more" onClick={() => setStep('pick')}>继续收藏到其他歌单</button>
          </div>
        )}

        {message && !message.ok && <div className="popup-error">{message.text}</div>}

        <div className="popup-note">
          <Monitor size={14} />
          <span>数据保存在本地浏览器，可随时在设置中备份</span>
        </div>
      </section>
    </div>
  );
}
