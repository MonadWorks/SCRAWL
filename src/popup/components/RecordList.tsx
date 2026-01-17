import type { InputRecord } from '../../utils/types';

interface RecordListProps {
  records: InputRecord[];
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
  onToggleStar: (id: number) => void;
  onDelete: (id: number) => void;
  onCopy: (content: string) => void;
}

export default function RecordList({
  records,
  selectedIds,
  onSelect,
  onToggleStar,
  onDelete,
  onCopy,
}: RecordListProps) {
  return (
    <div className="divide-y">
      {records.map((record) => (
        <RecordItem
          key={record.id}
          record={record}
          selected={record.id ? selectedIds.has(record.id) : false}
          onSelect={() => record.id && onSelect(record.id)}
          onToggleStar={() => record.id && onToggleStar(record.id)}
          onDelete={() => record.id && onDelete(record.id)}
          onCopy={() => onCopy(record.content)}
        />
      ))}
    </div>
  );
}

interface RecordItemProps {
  record: InputRecord;
  selected: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

function RecordItem({
  record,
  selected,
  onSelect,
  onToggleStar,
  onDelete,
  onCopy,
}: RecordItemProps) {
  const timeAgo = getTimeAgo(record.timestamp);

  return (
    <div
      className={`px-3 py-2 hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-xs text-gray-500 truncate max-w-[150px]">
            {record.domain}
          </span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Star */}
          <button
            onClick={onToggleStar}
            className={`p-1 rounded hover:bg-gray-200 ${
              record.starred ? 'text-yellow-500' : 'text-gray-400'
            }`}
            title={record.starred ? 'Unstar' : 'Star'}
          >
            <svg className="w-4 h-4" fill={record.starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          {/* Copy */}
          <button
            onClick={onCopy}
            className="p-1 rounded text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Copy"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1 rounded text-gray-400 hover:bg-red-100 hover:text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">
        {record.content}
      </p>

      {/* Tags */}
      {record.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
