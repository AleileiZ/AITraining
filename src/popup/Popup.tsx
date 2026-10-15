import { useEffect, useState } from 'react';
import { ExternalLink, Monitor } from 'lucide-react';
import './popup.css';

interface TabInfo {
  title: string;
  url: string;
}

export default function Popup() {
  const [tab, setTab] = useState<TabInfo | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const t = tabs[0];
      if (t && t.url) {
        setTab({ title: t.title || '未命名页面', url: t.url });
      }
    });
  }, []);

  const openFullPage = () => {
    void chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  };

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
        <div className="popup-field">
          <span className="popup-label">当前页面</span>
          {tab ? (
            <>
              <div className="popup-title" title={tab.title}>
                {tab.title}
              </div>
              <div className="popup-url" title={tab.url}>
                {tab.url}
              </div>
            </>
          ) : (
            <div className="popup-hint">无法读取当前标签页</div>
          )}
        </div>
        <div className="popup-note">
          <Monitor size={14} />
          <span>媒体检测与收藏功能即将开放</span>
        </div>
      </section>
    </div>
  );
}
