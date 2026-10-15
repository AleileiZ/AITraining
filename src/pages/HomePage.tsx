import { Sparkles } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function HomePage() {
  return (
    <section>
      <h1 className="page-title">首页</h1>
      <EmptyState
        icon={<Sparkles size={26} />}
        title="欢迎使用 WebTune"
        description="最近添加、歌单卡片与最近播放将在此展示，功能开发中。"
      />
    </section>
  );
}
