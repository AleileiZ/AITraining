import { Music2 } from 'lucide-react';
import './MiniPlayer.css';

export default function MiniPlayer() {
  return (
    <footer className="mini-player">
      <div className="mini-player-empty">
        <Music2 size={20} className="mini-player-empty-icon" />
        <span>还没有播放内容，在歌单中选择一条开始</span>
      </div>
    </footer>
  );
}
