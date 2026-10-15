import { useState } from 'react';
import Modal from './Modal';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
}

export default function CreatePlaylistModal({ onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim() || undefined);
  };

  return (
    <Modal title="创建歌单" onClose={onClose}>
      <div className="field">
        <label className="field-label">歌单名称</label>
        <input
          className="input"
          autoFocus
          placeholder="例如：通勤音乐"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>
      <div className="field">
        <label className="field-label">描述（可选）</label>
        <input
          className="input"
          placeholder="简单说明这个歌单"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>取消</button>
        <button className="btn btn-primary" disabled={!name.trim()} onClick={submit}>创建</button>
      </div>
    </Modal>
  );
}
