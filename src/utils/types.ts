// 输入记录
export interface InputRecord {
  id?: number;
  content: string;

  // 来源
  url: string;
  domain: string;
  pageTitle: string;
  timestamp: number;

  // 用户交互
  starred: boolean;
  tags: string[];
  deleted: boolean;
}

// 用户标签
export interface Tag {
  id?: number;
  name: string;
  color: string;
  createdAt: number;
}

// 设置
export interface Settings {
  enabled: boolean;
  whitelistDomains: string[];
  blacklistDomains: string[];
  retentionDays: number; // 0 = 永久
}

// 默认设置
export const DEFAULT_SETTINGS: Settings = {
  enabled: false, // opt-in 模式，默认关闭
  whitelistDomains: [],
  blacklistDomains: [],
  retentionDays: 0,
};

// 预设颜色
export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];
