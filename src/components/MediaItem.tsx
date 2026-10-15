import type { ReactNode } from 'react';
import type { ContentType, MediaItem } from '../types';
import {
  Film,
  Music2,
  Globe,
  HelpCircle,
  Play,
  ListPlus,
  Pencil,
  MinusCircle,
  Trash2,
  Activity
} from 'lucide-react';
import { formatRelativeTime } from '../utils/format';
import './MediaItem.css';

const TYPE_META: Record<ContentType, { label: string; icon: ReactNode }> = {
  video: { label: '视频', icon: <Film size={12} /> },
  audio: { label: '音频', icon: <Music2 size={12} /> },
  page: { label: '网页', icon: <Globe size={12} /> },
  unknown: { label: '未知', icon: <HelpCircle size={12} /> }
};

export function ContentTypeIcon({ type }: { type: ContentType }) {
  return <span className={`type-badge type-${type}`}>{TYPE_META[type].icon}</span>;
}

interface MediaItemProps {
  item: MediaItem;
  isCurrent: boolean;
  isPlaying: boolean;
  canRemoveFromPlaylist?: boolean;
  onOpen: () => void;
  onPlay: () => void;
  onAddToPlaylist: () => void;
  onEdit: () => void;
  onRemoveFromPlaylist?: () => void;
  onDelete: () => void;
}

export default function MediaItem({
  item,
  isCurrent,
  isPlaying,
  canRemoveFromPlaylist,
  onOpen,
  onPlay,
  onAddToPlaylist,
  onEdit,
  onRemoveFromPlaylist,
  onDelete
}: MediaItemProps) {
  const title = item.customTitle || item.title;
  return (
    <div className={`media-row${isCurrent ? ' current' : ''}`} onClick={onOpen}>
      <div className="media-cover-wrap">
        {item.coverUrl ? (
          <img className="media-cover" src={item.coverUrl} alt="" loading="lazy" />
        ) : (
          <div className="media-cover media-cover-fallback">{TYPE_META[item.contentType].icon}</div>
        )}
        {isCurrent && isPlaying && (
          <span className="media-playing"><Activity size={14} /></span>
        )}
      </div>
      <div className="media-main">
        <div className="media-title" title={title}>
          {title}
        </div>
        <div className="media-sub">
          {item.favicon ? <img className="media-favicon" src={item.favicon} alt="" /> : null}
          <span>{item.siteName}</span>
          <ContentTypeIcon type={item.contentType} />
          <span className="media-time">{formatRelativeTime(item.addedAt)}</span>
        </div>
      </div>
      <div className="media-actions">
        <button className="icon-btn" title="设为当前播放" onClick={(e) => { e.stopPropagation(); onPlay(); }}>
          <Play size={15} />
        </button>
        <button className="icon-btn" title="加入歌单" onClick={(e) => { e.stopPropagation(); onAddToPlaylist(); }}>
          <ListPlus size={15} />
        </button>
        <button className="icon-btn" title="编辑" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Pencil size={15} />
        </button>
        {canRemoveFromPlaylist && onRemoveFromPlaylist && (
          <button className="icon-btn" title="从歌单移除" onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(); }}>
            <MinusCircle size={15} />
          </button>
        )}
        <button className="icon-btn danger" title="删除收藏" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
