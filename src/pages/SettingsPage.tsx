import { Settings } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function SettingsPage() {
  return (
    <section>
      <h1 className="page-title">设置</h1>
      <EmptyState
        icon={<Settings size={26} />}
        title="设置功能开发中"
        description="备份导入导出与播放偏好将在下一阶段开放。"
      />
    </section>
  );
}
