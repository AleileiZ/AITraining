import { Music2, ExternalLink, Activity } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import './PlayerExpanded.css';

interface PlayerExpandedProps {
  queueIds: string[];
  onSelect: (itemId: string) => void;
}

export default function PlayerExpanded({ queueIds, onSelect }: PlayerExpandedProps) {
  const { data, player } = useApp();
  const currentId = player.state.currentItemId;

  return (
    <div className="player-expanded">
      <div className="pe-head">
        <span>播放队列（{queueIds.length}）</span>
        <button className="btn btn-ghost btn-sm" onClick={player.openCurrent}>
          <ExternalLink size={14} />
          在原网站播放
        </button>
      </div>
      <div className="pe-list">
        {queueIds.length === 0 && <div className="pe-empty">当前歌单还没有内容</div>}
        {queueIds.map((id) => {
          const item = data ? data.items.find((i) => i.id === id) : undefined;
          if (!item) return null;
          const active = id === currentId;
          return (
            <div
              key={id}
              className={`pe-row${active ? ' active' : ''}`}
              onClick={() => onSelect(id)}
            >
              <div className="pe-cover-wrap">
                {item.coverUrl ? (
                  <img className="pe-cover" src={item.coverUrl} alt="" loading="lazy" />
                ) : (
                  <div className="pe-cover pe-cover-fallback">
                    <Music2 size={13} />
                  </div>
                )}
                {active && <span className="pe-eq"><Activity size={12} /></span>}
              </div>
              <div className="pe-main">
                <div className="pe-title">{item.customTitle || item.title}</div>
                <div className="pe-site">{item.siteName}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pe-foot">
        不同网站存在跨域、版权与登录限制：无法在插件内直接播放的内容，会在原网站打开播放；本播放器不显示虚假进度。
      </div>
    </div>
  );
}
