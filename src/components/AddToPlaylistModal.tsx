import { useState } from 'react';
import type { MediaItem, Playlist } from '../types';
import Modal from './Modal';

interface AddToPlaylistModalProps {
  item: MediaItem;
  playlists: Playlist[];
  onClose: () => void;
  onConfirm: (playlistIds: string[]) => void;
}

export default function AddToPlaylistModal({ item, playlists, onClose, onConfirm }: AddToPlaylistModalProps) {
  const [selected, setSelected] = useState<string[]>(item.playlistIds);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Modal title="添加到歌单" onClose={onClose}>
      <div className="pl-picker-note">“{item.customTitle || item.title}” 当前在 {item.playlistIds.length} 个歌单中</div>
      <div className="pl-picker-list">
        {playlists.length === 0 && <div className="pl-picker-empty">还没有可用的歌单，请先创建。</div>}
        {playlists.map((p) => (
          <label key={p.id} className={`pl-picker-item${selected.includes(p.id) ? ' checked' : ''}`}>
            <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
            <span className="pl-picker-name">{p.name}</span>
            <span className="pl-picker-count">{p.itemIds.length}</span>
          </label>
        ))}
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={() => onConfirm(selected)}>保存</button>
      </div>
    </Modal>
  );
}
