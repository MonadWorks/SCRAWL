import { useState, useEffect } from 'react';
import { getStats } from '../../utils/storage';

interface StatsData {
  totalRecords: number;
  totalWords: number;
  byDomain: { domain: string; count: number }[];
  byDate: { date: string; count: number }[];
  byHour: { hour: number; count: number }[];
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const data = await getStats();
    setStats(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Loading stats...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No data available
      </div>
    );
  }

  const maxHourCount = Math.max(...stats.byHour.map(h => h.count), 1);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalRecords}
          </div>
          <div className="text-xs text-gray-600">Total Records</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(stats.totalWords)}
          </div>
          <div className="text-xs text-gray-600">Total Characters</div>
        </div>
      </div>

      {/* Top Domains */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Top Sites</h3>
        {stats.byDomain.length === 0 ? (
          <p className="text-sm text-gray-500">No data yet</p>
        ) : (
          <div className="space-y-2">
            {stats.byDomain.slice(0, 5).map((item) => (
              <div key={item.domain} className="flex items-center gap-2">
                <div className="flex-1 text-sm truncate text-gray-600">
                  {item.domain}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity by Hour */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Activity by Hour</h3>
        <div className="flex items-end gap-0.5 h-16">
          {stats.byHour.map((item) => (
            <div
              key={item.hour}
              className="flex-1 bg-blue-400 rounded-t"
              style={{
                height: `${(item.count / maxHourCount) * 100}%`,
                minHeight: item.count > 0 ? '4px' : '0',
              }}
              title={`${item.hour}:00 - ${item.count} records`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>6</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>

      {/* Recent 7 Days */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Last 7 Days</h3>
        {stats.byDate.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-1">
            {stats.byDate.map((item) => (
              <div key={item.date} className="flex items-center gap-2">
                <div className="text-xs text-gray-500 w-20">
                  {formatDate(item.date)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2"
                    style={{
                      width: `${Math.min(
                        100,
                        (item.count / Math.max(...stats.byDate.map(d => d.count))) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 w-8 text-right">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
