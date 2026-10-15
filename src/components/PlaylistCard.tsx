import type { MediaItem, Playlist } from '../types';
import { Pencil, Trash2, Music2 } from 'lucide-react';
import { formatCount } from '../utils/format';
import './PlaylistCard.css';

interface PlaylistCardProps {
  playlist: Playlist;
  items: MediaItem[];
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function CoverCollage({ items }: { items: MediaItem[] }) {
  const covers = items.filter((i) => i.coverUrl).slice(0, 4);
  if (covers.length === 0) {
    return (
      <div className="pl-cover pl-cover-default">
        <Music2 size={28} />
      </div>
    );
  }
  return (
    <div className={`pl-cover pl-collage cols-${Math.min(covers.length, 2)}`}>
      {covers.map((i) => (
        <img key={i.id} className="pl-collage-img" src={i.coverUrl} alt="" loading="lazy" />
      ))}
    </div>
  );
}

export default function PlaylistCard({ playlist, items, onOpen, onEdit, onDelete }: PlaylistCardProps) {
  return (
    <div className="pl-card" onClick={onOpen} role="button" tabIndex={0}>
      <CoverCollage items={items} />
      <div className="pl-card-body">
        <div className="pl-card-name" title={playlist.name}>
          {playlist.name}
        </div>
        <div className="pl-card-meta">
          <span>{formatCount(items.length)} 条内容</span>
          {playlist.description && <span className="pl-card-desc" title={playlist.description}>{playlist.description}</span>}
        </div>
      </div>
      {onEdit && onDelete && (
        <div className="pl-card-actions">
          <button className="icon-btn" title="编辑歌单" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Pencil size={15} />
          </button>
          <button className="icon-btn danger" title="删除歌单" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
