import { Search, ArrowUpDown } from 'lucide-react';
import type { SortKey, TypeFilter } from '../hooks/useMediaLibrary';
import './SearchBar.css';

interface SearchBarProps {
  query: string;
  onQuery: (v: string) => void;
  typeFilter: TypeFilter;
  onTypeFilter: (v: TypeFilter) => void;
  sortBy: SortKey;
  onSortBy: (v: SortKey) => void;
}

const TYPE_CHIPS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'page', label: '网页' },
  { value: 'unknown', label: '未知' }
];

export default function SearchBar({ query, onQuery, typeFilter, onTypeFilter, sortBy, onSortBy }: SearchBarProps) {
  return (
    <div className="search-bar">
      <div className="search-input-wrap">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          placeholder="搜索标题、网站或歌单"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>
      <div className="search-chips">
        {TYPE_CHIPS.map((c) => (
          <button
            key={c.value}
            className={`chip${typeFilter === c.value ? ' active' : ''}`}
            onClick={() => onTypeFilter(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <label className="sort-wrap">
        <ArrowUpDown size={14} />
        <select className="sort-select" value={sortBy} onChange={(e) => onSortBy(e.target.value as SortKey)}>
          <option value="added">按添加时间</option>
          <option value="title">按标题</option>
          <option value="site">按网站</option>
        </select>
      </label>
    </div>
  );
}
