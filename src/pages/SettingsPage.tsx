import { useRef, useState } from 'react';
import { Download, Upload, Database, Shuffle, Repeat, Play, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { downloadBackup, parseBackup } from '../services/backup';
import { createEmptyData } from '../services/migration';
import { formatCount } from '../utils/format';
import ConfirmDialog from '../components/ConfirmDialog';
import type { AppData } from '../types';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
}

function ToggleRow({ label, description, checked, onChange, icon }: ToggleRowProps) {
  return (
    <label className="toggle-row">
      <span className="toggle-icon">{icon}</span>
      <span className="toggle-text">
        <span className="toggle-label">{label}</span>
        <span className="toggle-desc">{description}</span>
      </span>
      <span className={`switch${checked ? ' on' : ''}`}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="switch-slider" />
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const { data, mutate } = useApp();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [importCandidate, setImportCandidate] = useState<AppData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  if (!data) return null;
  const s = data.settings;

  const onFile = (file: File | undefined) => {
    setImportError(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackup(String(reader.result));
        setImportCandidate(parsed);
      } catch (e) {
        setImportError(e instanceof Error ? e.message : '导入失败');
      }
    };
    reader.readAsText(file);
  };

  return (
    <section>
      <h1 className="page-title">设置</h1>

      <h2 className="section-title">数据统计</h2>
      <div className="settings-stats">
        <div className="stat-card">
          <Database size={18} className="stat-icon" />
          <span className="stat-num">{formatCount(data.items.length)}</span>
          <span className="stat-label">收藏内容</span>
        </div>
        <div className="stat-card">
          <Database size={18} className="stat-icon" />
          <span className="stat-num">{formatCount(data.playlists.length)}</span>
          <span className="stat-label">歌单（含默认）</span>
        </div>
      </div>

      <h2 className="section-title">播放偏好</h2>
      <div className="settings-card card">
        <ToggleRow
          icon={<Shuffle size={16} />}
          label="随机播放"
          description="切换下一首时随机选取队列内容"
          checked={s.shuffle}
          onChange={() => mutate((d) => ({ ...d, settings: { ...d.settings, shuffle: !d.settings.shuffle } }))}
        />
        <ToggleRow
          icon={<Repeat size={16} />}
          label="循环播放"
          description="到队列末尾后回到开头继续"
          checked={s.loop}
          onChange={() => mutate((d) => ({ ...d, settings: { ...d.settings, loop: !d.settings.loop } }))}
        />
        <ToggleRow
          icon={<Play size={16} />}
          label="自动打开原网页"
          description="切换内容时自动在原网站打开播放页"
          checked={s.autoplay}
          onChange={() => mutate((d) => ({ ...d, settings: { ...d.settings, autoplay: !d.settings.autoplay } }))}
        />
      </div>

      <h2 className="section-title">备份与恢复</h2>
      <div className="settings-card card backup-card">
        <p className="backup-desc">所有数据都保存在本机浏览器中。导出 JSON 备份可在其他设备或重装后恢复。</p>
        <div className="backup-actions">
          <button className="btn btn-ghost" onClick={() => downloadBackup(data)}>
            <Download size={15} />
            导出备份
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={15} />
            导入备份
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
        {importError && <div className="form-error">{importError}</div>}
      </div>

      <h2 className="section-title">危险操作</h2>
      <div className="settings-card card">
        <button className="btn btn-danger" onClick={() => setClearOpen(true)}>
          <Trash2 size={15} />
          清空所有数据
        </button>
        <p className="danger-desc">清空收藏、歌单与播放设置，不可恢复。建议先导出备份。</p>
      </div>

      {importCandidate && (
        <ConfirmDialog
          title="导入备份"
          message={
            <>
              导入 {importCandidate.items.length} 条收藏、{importCandidate.playlists.length} 个歌单？当前数据将被备份数据覆盖。
            </>
          }
          confirmLabel="导入并覆盖"
          danger
          onConfirm={() => {
            void mutate(() => importCandidate);
            setImportCandidate(null);
            setImportError(null);
            if (fileRef.current) fileRef.current.value = '';
          }}
          onClose={() => setImportCandidate(null)}
        />
      )}
      {clearOpen && (
        <ConfirmDialog
          title="清空所有数据"
          message="确定清空全部收藏与歌单吗？此操作不可恢复。"
          confirmLabel="全部清空"
          danger
          onConfirm={() => {
            void mutate(() => createEmptyData());
            setClearOpen(false);
          }}
          onClose={() => setClearOpen(false)}
        />
      )}
    </section>
  );
}
