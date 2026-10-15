import { useState } from 'react';
import { Music2, Shuffle, Repeat, SkipBack, SkipForward, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import type { AppData } from '../types';
import { useApp } from '../hooks/useApp';
import { resolveQueueIds } from '../utils/library';
import PlayerExpanded from './PlayerExpanded';
import './MiniPlayer.css';

function playlistLabel(data: AppData | null, playlistId: string | null): string {
  if (!playlistId) return '全部收藏';
  if (playlistId === 'all') return '全部收藏';
  if (playlistId === 'recent') return '最近添加';
  const pl = data ? data.playlists.find((p) => p.id === playlistId) : undefined;
  return pl ? pl.name : '全部收藏';
}

export default function MiniPlayer() {
  const { data, player } = useApp();
  const { state, currentItem, next, prev, openCurrent, toggleShuffle, toggleLoop } = player;
  const [expanded, setExpanded] = useState(false);

  if (!currentItem || !data) {
    return (
      <footer className="mini-player">
        <div className="mini-player-empty">
          <Music2 size={20} className="mini-player-empty-icon" />
          <span>还没有播放内容，在歌单中选择一条开始</span>
        </div>
      </footer>
    );
  }

  const title = currentItem.customTitle || currentItem.title;
  const shuffleOn = data?.settings.shuffle ?? false;
  const loopOn = data?.settings.loop ?? false;

  return (
    <footer className="mini-player">
      <div className="mp-left">
        {currentItem.coverUrl ? (
          <img className="mp-cover" src={currentItem.coverUrl} alt="" />
        ) : (
          <div className="mp-cover mp-cover-fallback">
            <Music2 size={18} />
          </div>
        )}
        <div className="mp-info">
          <div className="mp-title" title={title}>{title}</div>
          <div className="mp-site">{currentItem.siteName}</div>
        </div>
      </div>

      <div className="mp-center">
        <button
          className={`icon-btn mp-toggle${shuffleOn ? ' active' : ''}`}
          title="随机播放"
          onClick={toggleShuffle}
        >
          <Shuffle size={15} />
        </button>
        <button className="icon-btn" title="上一首" onClick={prev}>
          <SkipBack size={18} />
        </button>
        <button
          className="mp-play-btn"
          title="在原网站播放"
          onClick={openCurrent}
        >
          {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button className="icon-btn" title="下一首" onClick={next}>
          <SkipForward size={18} />
        </button>
        <button
          className={`icon-btn mp-toggle${loopOn ? ' active' : ''}`}
          title="循环播放"
          onClick={toggleLoop}
        >
          <Repeat size={15} />
        </button>
      </div>

      <div className="mp-right">
        <span className="mp-playlist" title="当前播放歌单">
          {playlistLabel(data, state.playlistId)}
        </span>
        <button
          className="icon-btn"
          title={expanded ? '收起播放队列' : '展开播放队列'}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {expanded && (
        <PlayerExpanded
          queueIds={resolveQueueIds(data, state.playlistId)}
          onSelect={(itemId) => player.playItem(itemId, state.playlistId ?? undefined)}
        />
      )}
    </footer>
  );
}
