import { useState } from 'react';
import type { ReactNode } from 'react';
import { ListMusic, Library, Clock, Headphones, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useMediaLibrary, type SortKey, type TypeFilter } from '../hooks/useMediaLibrary';
import { resolvePlaylistItems, isVirtualPlaylist } from '../utils/library';
import SearchBar from '../components/SearchBar';
import PlaylistCard from '../components/PlaylistCard';
import MediaItem from '../components/MediaItem';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import EditPlaylistModal from '../components/EditPlaylistModal';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import EditItemModal from '../components/EditItemModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import type { View } from '../App';
import type { MediaItem as MediaItemType, Playlist as PlaylistType } from '../types';

interface PlaylistPageProps {
  playlistId: string;
  onNavigate: (view: View) => void;
}

const VIRTUAL_META: Record<string, { name: string; icon: ReactNode; desc: string }> = {
  all: { name: '全部收藏', icon: <Library size={20} />, desc: '你收藏的全部内容' },
  recent: { name: '最近添加', icon: <Clock size={20} />, desc: '按添加时间从新到旧' },
  my: { name: '我的歌单', icon: <ListMusic size={20} />, desc: '管理自定义歌单' },
  listen: { name: '稍后收听', icon: <Headphones size={20} />, desc: '稍后收听' }
};

export default function PlaylistPage({ playlistId, onNavigate }: PlaylistPageProps) {
  const { data, playlists, player } = useApp();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('added');
  const [createOpen, setCreateOpen] = useState(false);
  const [editPl, setEditPl] = useState<PlaylistType | null>(null);
  const [addToItem, setAddToItem] = useState<MediaItemType | null>(null);
  const [editItem, setEditItem] = useState<MediaItemType | null>(null);
  const [delItem, setDelItem] = useState<MediaItemType | null>(null);
  const [delPl, setDelPl] = useState<PlaylistType | null>(null);

  if (!data) return null;

  if (playlistId === 'my') {
    return (
      <section>
        <div className="page-head">
          <h1 className="page-title">我的歌单</h1>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            <FolderPlus size={16} />
            创建歌单
          </button>
        </div>
        {playlists.custom.length === 0 ? (
          <EmptyState
            title="还没有歌单"
            description="创建第一个歌单，把不同网站的视频和音频整理到一起"
          />
        ) : (
          <div className="card-grid">
            {playlists.custom.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                items={data.items.filter((i) => pl.itemIds.includes(i.id))}
                onOpen={() => onNavigate({ name: 'playlist', playlistId: pl.id })}
                onEdit={() => setEditPl(pl)}
                onDelete={() => setDelPl(pl)}
              />
            ))}
          </div>
        )}
        {createOpen && (
          <CreatePlaylistModal
            onClose={() => setCreateOpen(false)}
            onCreate={(name, desc) => {
              playlists.create(name, desc);
              setCreateOpen(false);
            }}
          />
        )}
        {editPl && (
          <EditPlaylistModal
            playlist={editPl}
            onClose={() => setEditPl(null)}
            onSave={(patch) => {
              playlists.update(editPl.id, patch);
              setEditPl(null);
            }}
          />
        )}
        {delPl && (
          <ConfirmDialog
            title="删除歌单"
            message={<>删除歌单「{delPl.name}」？歌单内的收藏记录不会被删除，仍保留在全部收藏中。</>}
            confirmLabel="删除歌单"
            danger
            onConfirm={() => playlists.remove(delPl.id)}
            onClose={() => setDelPl(null)}
          />
        )}
      </section>
    );
  }

  const playlist = playlists.get(playlistId);
  const virtual = isVirtualPlaylist(playlistId);
  const meta = VIRTUAL_META[playlistId] ?? (playlist ? { name: playlist.name, icon: <ListMusic size={20} />, desc: playlist.description || '自定义歌单' } : null);
  if (!meta) {
    return <EmptyState title="歌单不存在" description="该歌单可能已被删除" />;
  }

  const baseItems = resolvePlaylistItems(data, playlistId);
  const filtered = useMediaLibrary(
    { ...data, items: baseItems },
    query,
    typeFilter,
    sortBy
  );
  const searching = query.trim() !== '' || typeFilter !== 'all';
  const shown = searching ? filtered : baseItems;

  return (
    <section>
      <div className="page-head">
        <div className="pl-head-title">
          <span className="pl-head-icon">{meta.icon}</span>
          <div>
            <h1 className="page-title">{meta.name}</h1>
            <div className="pl-head-desc">{meta.desc} · {baseItems.length} 条内容</div>
          </div>
        </div>
        {playlist && !virtual && (
          <div className="page-head-actions">
            <button className="btn btn-ghost" onClick={() => setEditPl(playlist)}>
              <Pencil size={15} />
              编辑
            </button>
            <button className="btn btn-ghost" onClick={() => setDelPl(playlist)}>
              <Trash2 size={15} />
              删除
            </button>
          </div>
        )}
      </div>

      <SearchBar
        query={query}
        onQuery={setQuery}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        sortBy={sortBy}
        onSortBy={setSortBy}
      />

      {shown.length === 0 ? (
        <EmptyState
          title={searching ? '没有匹配的内容' : '这个歌单还是空的'}
          description={searching ? '试试更换关键词或筛选条件' : '去任意视频或音频网页，点击工具栏 WebTune 图标收藏'}
        />
      ) : (
        <div className="media-list">
          {shown.map((item) => (
            <MediaItem
              key={item.id}
              item={item}
              isCurrent={player.state.currentItemId === item.id}
              isPlaying={player.state.isPlaying}
              canRemoveFromPlaylist={!virtual}
              onOpen={() => player.playAndOpen(item.id, playlistId)}
              onPlay={() => player.playItem(item.id, playlistId)}
              onAddToPlaylist={() => setAddToItem(item)}
              onEdit={() => setEditItem(item)}
              onRemoveFromPlaylist={virtual ? undefined : () => playlists.removeItem(item.id, playlistId)}
              onDelete={() => setDelItem(item)}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreatePlaylistModal
          onClose={() => setCreateOpen(false)}
          onCreate={(name, desc) => {
            playlists.create(name, desc);
            setCreateOpen(false);
          }}
        />
      )}
      {editPl && (
        <EditPlaylistModal
          playlist={editPl}
          onClose={() => setEditPl(null)}
          onSave={(patch) => {
            playlists.update(editPl.id, patch);
            setEditPl(null);
          }}
        />
      )}
      {addToItem && (
        <AddToPlaylistModal
          item={addToItem}
          playlists={data.playlists.filter((p) => p.kind === 'custom')}
          onClose={() => setAddToItem(null)}
          onConfirm={(ids) => {
            playlists.addItemToMany(addToItem.id, ids);
            setAddToItem(null);
          }}
        />
      )}
      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={(patch) => {
            playlists.updateItem(editItem.id, patch);
            setEditItem(null);
          }}
        />
      )}
      {delItem && (
        <ConfirmDialog
          title="删除收藏"
          message={<>确定彻底删除「{delItem.customTitle || delItem.title}」吗？该操作会从所有歌单中移除，不可恢复。</>}
          confirmLabel="彻底删除"
          danger
          onConfirm={() => playlists.deleteItem(delItem.id)}
          onClose={() => setDelItem(null)}
        />
      )}
      {delPl && playlist && (
        <ConfirmDialog
          title="删除歌单"
          message={<>删除歌单「{playlist.name}」？歌单内的收藏记录不会被删除，仍保留在全部收藏中。</>}
          confirmLabel="删除歌单"
          danger
          onConfirm={() => {
            playlists.remove(playlist.id);
            onNavigate({ name: 'home' });
          }}
          onClose={() => setDelPl(null)}
        />
      )}
    </section>
  );
}
