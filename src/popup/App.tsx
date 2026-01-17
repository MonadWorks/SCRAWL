import { useState, useEffect } from 'react';
import { getRecords, getSettings, saveSettings, toggleStar, deleteRecord, getAllTags } from '../utils/storage';
import type { InputRecord, Settings, Tag } from '../utils/types';
import { DEFAULT_SETTINGS } from '../utils/types';
import RecordList from './components/RecordList';
import SearchBar from './components/SearchBar';
import Stats from './components/Stats';

type View = 'records' | 'stats';

export default function App() {
  const [view, setView] = useState<View>('records');
  const [records, setRecords] = useState<InputRecord[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜索和筛选
  const [search, setSearch] = useState('');
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 加载数据
  useEffect(() => {
    loadData();
  }, [search, filterStarred, filterTag]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [recordsData, tagsData, settingsData] = await Promise.all([
        getRecords({
          limit: 100,
          starred: filterStarred || undefined,
          tag: filterTag || undefined,
          search: search || undefined,
        }),
        getAllTags(),
        getSettings(),
      ]);
      setRecords(recordsData);
      setTags(tagsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // 切换启用状态
  async function handleToggleEnabled() {
    try {
      const newSettings = { ...settings, enabled: !settings.enabled };
      await saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  }

  // 切换星标
  async function handleToggleStar(id: number) {
    await toggleStar(id);
    loadData();
  }

  // 删除记录
  async function handleDelete(id: number) {
    await deleteRecord(id);
    loadData();
  }

  // 批量删除
  async function handleBatchDelete() {
    for (const id of selectedIds) {
      await deleteRecord(id);
    }
    setSelectedIds(new Set());
    loadData();
  }

  // 复制内容
  function handleCopy(content: string) {
    navigator.clipboard.writeText(content);
  }

  // 导出选中
  function handleExportSelected() {
    const selectedRecords = records.filter(r => r.id && selectedIds.has(r.id));
    const data = JSON.stringify(selectedRecords, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `input-records-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 选择/取消选择
  function handleSelect(id: number) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  // 全选/取消全选
  function handleSelectAll() {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map(r => r.id!).filter(Boolean)));
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Error Banner */}
      {error && (
        <div className="px-3 py-2 bg-red-100 text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <h1 className="text-lg font-semibold text-gray-800">Input Recorder</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleEnabled}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              settings.enabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {settings.enabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setView('records')}
          className={`flex-1 py-2 text-sm font-medium ${
            view === 'records'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Records
        </button>
        <button
          onClick={() => setView('stats')}
          className={`flex-1 py-2 text-sm font-medium ${
            view === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Content */}
      {view === 'records' ? (
        <>
          {/* Search & Filters */}
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            filterStarred={filterStarred}
            onFilterStarredChange={setFilterStarred}
            filterTag={filterTag}
            onFilterTagChange={setFilterTag}
            tags={tags}
          />

          {/* Batch Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b">
              <span className="text-sm text-blue-700">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleExportSelected}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Records List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                Loading...
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <p>No records yet</p>
                {!settings.enabled && (
                  <p className="text-sm mt-1">Turn on recording to start</p>
                )}
              </div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs text-gray-500 flex justify-between items-center">
                  <span>{records.length} records</span>
                  <button
                    onClick={handleSelectAll}
                    className="text-blue-500 hover:underline"
                  >
                    {selectedIds.size === records.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <RecordList
                  records={records}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  onToggleStar={handleToggleStar}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <Stats />
      )}
    </div>
  );
}
