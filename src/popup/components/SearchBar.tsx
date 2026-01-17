import type { Tag } from '../../utils/types';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStarred: boolean;
  onFilterStarredChange: (value: boolean) => void;
  filterTag: string | null;
  onFilterTagChange: (value: string | null) => void;
  tags: Tag[];
}

export default function SearchBar({
  search,
  onSearchChange,
  filterStarred,
  onFilterStarredChange,
  filterTag,
  onFilterTagChange,
  tags,
}: SearchBarProps) {
  return (
    <div className="p-3 border-b space-y-2">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search records..."
          className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Starred Filter */}
        <button
          onClick={() => onFilterStarredChange(!filterStarred)}
          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
            filterStarred
              ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="mr-1">{filterStarred ? '★' : '☆'}</span>
          Starred
        </button>

        {/* Tag Filters */}
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onFilterTagChange(filterTag === tag.name ? null : tag.name)}
            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
              filterTag === tag.name
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
