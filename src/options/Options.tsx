import { useState, useEffect } from 'react';
import { getSettings, saveSettings, exportAllData, clearAllData, getAllTags, addTag, deleteTag } from '../utils/storage';
import type { Settings, Tag } from '../utils/types';
import { TAG_COLORS, DEFAULT_SETTINGS } from '../utils/types';

export default function Options() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [settingsData, tagsData] = await Promise.all([
      getSettings(),
      getAllTags(),
    ]);
    setSettings(settingsData);
    setTags(tagsData);
  }

  async function handleSave() {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    showMessage('Settings saved!');
  }

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  // Whitelist management
  function handleAddWhitelist() {
    if (newDomain && !settings.whitelistDomains.includes(newDomain)) {
      setSettings({
        ...settings,
        whitelistDomains: [...settings.whitelistDomains, newDomain],
      });
      setNewDomain('');
    }
  }

  function handleRemoveWhitelist(domain: string) {
    setSettings({
      ...settings,
      whitelistDomains: settings.whitelistDomains.filter(d => d !== domain),
    });
  }

  // Blacklist management
  function handleAddBlacklist() {
    if (newDomain && !settings.blacklistDomains.includes(newDomain)) {
      setSettings({
        ...settings,
        blacklistDomains: [...settings.blacklistDomains, newDomain],
      });
      setNewDomain('');
    }
  }

  function handleRemoveBlacklist(domain: string) {
    setSettings({
      ...settings,
      blacklistDomains: settings.blacklistDomains.filter(d => d !== domain),
    });
  }

  // Tag management
  async function handleAddTag() {
    if (newTag && !tags.some(t => t.name === newTag)) {
      await addTag({
        name: newTag,
        color: selectedColor,
        createdAt: Date.now(),
      });
      setNewTag('');
      loadData();
    }
  }

  async function handleDeleteTag(id: number) {
    await deleteTag(id);
    loadData();
  }

  // Export
  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `input-recorder-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Data exported!');
  }

  // Clear
  async function handleClear() {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      await clearAllData();
      setSettings(DEFAULT_SETTINGS);
      setTags([]);
      showMessage('All data cleared!');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Input Recorder Settings</h1>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      {/* Enable/Disable */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Recording</h2>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="w-5 h-5 rounded"
          />
          <span className="text-gray-600">Enable input recording</span>
        </label>
        <p className="text-sm text-gray-500 mt-1 ml-8">
          When disabled, no inputs will be recorded.
        </p>
      </section>

      {/* Whitelist */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Whitelist</h2>
        <p className="text-sm text-gray-500 mb-3">
          Only record inputs from these domains. Leave empty to record all domains.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g., chat.openai.com"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddWhitelist}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add to Whitelist
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.whitelistDomains.map((domain) => (
            <span
              key={domain}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1"
            >
              {domain}
              <button
                onClick={() => handleRemoveWhitelist(domain)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Blacklist */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Blacklist</h2>
        <p className="text-sm text-gray-500 mb-3">
          Never record inputs from these domains.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g., bank.com"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddBlacklist}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Add to Blacklist
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.blacklistDomains.map((domain) => (
            <span
              key={domain}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1"
            >
              {domain}
              <button
                onClick={() => handleRemoveBlacklist(domain)}
                className="ml-1 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Tags</h2>
        <p className="text-sm text-gray-500 mb-3">
          Create tags to organize your records.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Tag name"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-1">
            {TAG_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Tag
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 rounded-full flex items-center gap-1"
              style={{ backgroundColor: tag.color + '30', color: tag.color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              <button
                onClick={() => tag.id && handleDeleteTag(tag.id)}
                className="ml-1 hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Retention */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Data Retention</h2>
        <div className="flex items-center gap-3">
          <select
            value={settings.retentionDays}
            onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Keep forever</option>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
          <span className="text-sm text-gray-500">
            Records older than this will be automatically deleted.
          </span>
        </div>
      </section>

      {/* Data Management */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Data Management</h2>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Export All Data
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All Data
          </button>
        </div>
      </section>

      {/* Save Button */}
      <div className="sticky bottom-4 bg-white py-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
