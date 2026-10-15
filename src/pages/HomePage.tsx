import { useState } from 'react';
import { FolderPlus, Sparkles, ExternalLink } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useMediaLibrary, type SortKey, type TypeFilter } from '../hooks/useMediaLibrary';
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

interface HomePageProps {
  onNavigate: (view: View) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
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

  const items = useMediaLibrary(data, query, typeFilter, sortBy);
  const searching = query.trim() !== '' || typeFilter !== 'all';
  const recent = data
    ? [...data.items].sort((a, b) => b.addedAt - a.addedAt).slice(0, 8)
    : [];

  const current = player.currentItem;

  return (
    <section>
      <div className="page-head">
        <h1 className="page-title">首页</h1>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <FolderPlus size={16} />
          创建歌单
        </button>
      </div>

      <SearchBar
        query={query}
        onQuery={setQuery}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        sortBy={sortBy}
        onSortBy={setSortBy}
      />

      {current && (
        <div className="now-playing card" onClick={() => player.openCurrent()}>
          {current.coverUrl ? <img className="np-cover" src={current.coverUrl} alt="" /> : null}
          <div className="np-info">
            <div className="np-label">正在播放</div>
            <div className="np-title">{current.customTitle || current.title}</div>
            <div className="np-site">{current.siteName}</div>
          </div>
          <ExternalLink size={16} className="np-icon" />
        </div>
      )}

      {searching ? (
        <>
          <h2 className="section-title">搜索结果（{items.length}）</h2>
          {items.length === 0 ? (
            <EmptyState title="没有找到匹配的内容" description="试试更换关键词或筛选条件" />
          ) : (
            <div className="media-list">
              {items.map((item) => (
                <MediaItem
                  key={item.id}
                  item={item}
                  isCurrent={player.state.currentItemId === item.id}
                  isPlaying={player.state.isPlaying}
                  onOpen={() => player.playAndOpen(item.id)}
                  onPlay={() => player.playItem(item.id)}
                  onAddToPlaylist={() => setAddToItem(item)}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => setDelItem(item)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="section-title">我的歌单</h2>
          {playlists.custom.length === 0 ? (
            <div className="section-empty">
              <EmptyState
                icon={<Sparkles size={26} />}
                title="还没有歌单"
                description="创建第一个歌单，把不同网站的视频和音频整理到一起"
              />
            </div>
          ) : (
            <div className="card-grid">
              {playlists.custom.map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  items={data ? data.items.filter((i) => pl.itemIds.includes(i.id)) : []}
                  onOpen={() => onNavigate({ name: 'playlist', playlistId: pl.id })}
                  onEdit={() => setEditPl(pl)}
                  onDelete={() => setDelPl(pl)}
                />
              ))}
            </div>
          )}

          <h2 className="section-title">最近添加</h2>
          {recent.length === 0 ? (
            <div className="section-empty">
              <EmptyState
                title="还没有收藏内容"
                description="打开任意视频或音频网页，点击工具栏 WebTune 图标即可收藏"
              />
            </div>
          ) : (
            <div className="media-list">
              {recent.map((item) => (
                <MediaItem
                  key={item.id}
                  item={item}
                  isCurrent={player.state.currentItemId === item.id}
                  isPlaying={player.state.isPlaying}
                  onOpen={() => player.playAndOpen(item.id)}
                  onPlay={() => player.playItem(item.id)}
                  onAddToPlaylist={() => setAddToItem(item)}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => setDelItem(item)}
                />
              ))}
            </div>
          )}
        </>
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
      {addToItem && data && (
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
          message={
            <>
              确定彻底删除「{delItem.customTitle || delItem.title}」吗？该操作会从所有歌单中移除，不可恢复。
            </>
          }
          confirmLabel="彻底删除"
          danger
          onConfirm={() => playlists.deleteItem(delItem.id)}
          onClose={() => setDelItem(null)}
        />
      )}
      {delPl && (
        <ConfirmDialog
          title="删除歌单"
          message={
            <>
              删除歌单「{delPl.name}」？歌单内的收藏记录不会被删除，仍保留在全部收藏中。
            </>
          }
          confirmLabel="删除歌单"
          danger
          onConfirm={() => playlists.remove(delPl.id)}
          onClose={() => setDelPl(null)}
        />
      )}
    </section>
  );
}
