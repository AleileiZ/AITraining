import type { ReactNode } from 'react';
import { Home, Library, ListMusic, Clock, Headphones, FolderPlus, Settings } from 'lucide-react';
import type { View } from '../App';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  view: View;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页', icon: <Home size={18} />, view: { name: 'home' } },
  { id: 'all', label: '全部收藏', icon: <Library size={18} />, view: { name: 'playlist', playlistId: 'all' } },
  { id: 'my', label: '我的歌单', icon: <ListMusic size={18} />, view: { name: 'playlist', playlistId: 'my' } },
  { id: 'recent', label: '最近添加', icon: <Clock size={18} />, view: { name: 'playlist', playlistId: 'recent' } },
  { id: 'listen', label: '稍后收听', icon: <Headphones size={18} />, view: { name: 'playlist', playlistId: 'seed-4' } }
];

function isActive(item: NavItem, view: View): boolean {
  if (item.view.name !== view.name) return false;
  if (view.name === 'playlist' && item.view.name === 'playlist') {
    return item.view.playlistId === view.playlistId;
  }
  return true;
}

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
  onCreatePlaylist: () => void;
}

export default function Sidebar({ view, onNavigate, onCreatePlaylist }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">♪</span>
        <span className="sidebar-name">WebTune</span>
      </div>
      <button className="sidebar-create" onClick={onCreatePlaylist}>
        <FolderPlus size={16} />
        创建歌单
      </button>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${isActive(item, view) ? ' active' : ''}`}
            onClick={() => onNavigate(item.view)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <button
          className={`nav-item${view.name === 'settings' ? ' active' : ''}`}
          onClick={() => onNavigate({ name: 'settings' })}
        >
          <span className="nav-icon"><Settings size={18} /></span>
          <span>设置</span>
        </button>
      </nav>
      <div className="sidebar-footer">本地收藏 · 仅存于你的浏览器</div>
    </aside>
  );
}
