import { useState } from 'react';
import type { ContentType, MediaItem } from '../types';
import type { ItemPatch } from '../hooks/usePlaylists';
import Modal from './Modal';

const TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'page', label: '网页' },
  { value: 'unknown', label: '未知' }
];

interface EditItemModalProps {
  item: MediaItem;
  onClose: () => void;
  onSave: (patch: ItemPatch) => void;
}

export default function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
  const [customTitle, setCustomTitle] = useState(item.customTitle || '');
  const [note, setNote] = useState(item.note || '');
  const [contentType, setContentType] = useState<ContentType>(item.contentType);
  const [coverUrl, setCoverUrl] = useState(item.coverUrl || '');

  const submit = () => {
    onSave({
      customTitle: customTitle.trim() || undefined,
      note: note.trim() || undefined,
      contentType,
      coverUrl: coverUrl.trim() || undefined
    });
  };

  return (
    <Modal title="编辑收藏" onClose={onClose}>
      <div className="field">
        <label className="field-label">标题（留空则显示原标题）</label>
        <input className="input" autoFocus value={customTitle} placeholder={item.title} onChange={(e) => setCustomTitle(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">备注</label>
        <textarea className="textarea" value={note} placeholder="补充说明、标签等" onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">内容类型</label>
        <select className="select" value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)}>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label">封面图片 URL（可选）</label>
        <input className="input" value={coverUrl} placeholder="https://…" onChange={(e) => setCoverUrl(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>取消</button>
        <button className="btn btn-primary" onClick={submit}>保存</button>
      </div>
    </Modal>
  );
}
