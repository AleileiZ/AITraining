import { ListMusic } from 'lucide-react';
import EmptyState from '../components/EmptyState';

interface PlaylistPageProps {
  playlistId: string;
}

export default function PlaylistPage({ playlistId }: PlaylistPageProps) {
  return (
    <section>
      <h1 className="page-title">歌单 · {playlistId}</h1>
      <EmptyState
        icon={<ListMusic size={26} />}
        title="歌单内容即将接入"
        description="收藏列表、播放与整理功能将在下一阶段开放。"
      />
    </section>
  );
}
