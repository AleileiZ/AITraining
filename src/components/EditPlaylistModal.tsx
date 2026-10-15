import { useState } from 'react';
import type { Playlist } from '../types';
import Modal from './Modal';

interface EditPlaylistModalProps {
  playlist: Playlist;
  onClose: () => void;
  onSave: (patch: { name?: string; description?: string }) => void;
}

export default function EditPlaylistModal({ playlist, onClose, onSave }: EditPlaylistModalProps) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || '');

  const submit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || undefined });
  };

  return (
    <Modal title={`编辑歌单「${playlist.name}」`} onClose={onClose}>
      <div className="field">
        <label className="field-label">歌单名称</label>
        <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </div>
      <div className="field">
        <label className="field-label">描述（可选）</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>取消</button>
        <button className="btn btn-primary" disabled={!name.trim()} onClick={submit}>保存</button>
      </div>
    </Modal>
  );
}
