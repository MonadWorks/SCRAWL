import Dexie, { type EntityTable } from 'dexie';
import type { InputRecord, Tag, Settings } from './types';
import { DEFAULT_SETTINGS } from './types';

class RecorderDB extends Dexie {
  records!: EntityTable<InputRecord, 'id'>;
  tags!: EntityTable<Tag, 'id'>;

  constructor() {
    super('InputRecorderDB');
    this.version(3).stores({
      records: '++id, domain, timestamp, starred, *tags, deleted',
      tags: '++id, name',
    });
  }
}

export const db = new RecorderDB();

export async function addRecord(record: Omit<InputRecord, 'id'>): Promise<number> {
  const id = await db.records.add(record);
  return id as number;
}

export async function getRecords(options?: {
  limit?: number;
  offset?: number;
  domain?: string;
  starred?: boolean;
  tag?: string;
  search?: string;
}): Promise<InputRecord[]> {
  let results = await db.records.filter(r => !r.deleted).toArray();

  if (options?.domain) {
    results = results.filter(r => r.domain === options.domain);
  }
  if (options?.starred) {
    results = results.filter(r => r.starred);
  }

  results.sort((a, b) => b.timestamp - a.timestamp);

  if (options?.tag) {
    results = results.filter(r => r.tags.includes(options.tag!));
  }
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    results = results.filter(r => r.content.toLowerCase().includes(searchLower));
  }
  if (options?.offset) {
    results = results.slice(options.offset);
  }
  if (options?.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

export async function getRecordById(id: number): Promise<InputRecord | undefined> {
  return await db.records.get(id);
}

export async function updateRecord(id: number, changes: Partial<InputRecord>): Promise<void> {
  await db.records.update(id, changes);
}

export async function deleteRecord(id: number, hard = false): Promise<void> {
  if (hard) {
    await db.records.delete(id);
  } else {
    await db.records.update(id, { deleted: true });
  }
}

export async function toggleStar(id: number): Promise<void> {
  const record = await db.records.get(id);
  if (record) {
    await db.records.update(id, { starred: !record.starred });
  }
}

export async function addTagToRecord(recordId: number, tagName: string): Promise<void> {
  const record = await db.records.get(recordId);
  if (record && !record.tags.includes(tagName)) {
    await db.records.update(recordId, { tags: [...record.tags, tagName] });
  }
}

export async function removeTagFromRecord(recordId: number, tagName: string): Promise<void> {
  const record = await db.records.get(recordId);
  if (record) {
    await db.records.update(recordId, { tags: record.tags.filter(t => t !== tagName) });
  }
}

export async function getAllTags(): Promise<Tag[]> {
  return await db.tags.toArray();
}

export async function addTag(tag: Omit<Tag, 'id'>): Promise<number> {
  const id = await db.tags.add(tag);
  return id as number;
}

export async function deleteTag(id: number): Promise<void> {
  await db.tags.delete(id);
}

const SETTINGS_KEY = 'settings';

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  const settings = result[SETTINGS_KEY] as Settings | undefined;
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function getStats(): Promise<{
  totalRecords: number;
  totalWords: number;
  byDomain: { domain: string; count: number }[];
  byDate: { date: string; count: number }[];
  byHour: { hour: number; count: number }[];
}> {
  const records = await db.records.filter(r => !r.deleted).toArray();

  const totalRecords = records.length;
  const totalWords = records.reduce((sum, r) => sum + r.content.length, 0);

  const domainMap = new Map<string, number>();
  records.forEach(r => {
    domainMap.set(r.domain, (domainMap.get(r.domain) || 0) + 1);
  });
  const byDomain = Array.from(domainMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const dateMap = new Map<string, number>();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  records
    .filter(r => r.timestamp > sevenDaysAgo)
    .forEach(r => {
      const date = new Date(r.timestamp).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
  const byDate = Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const hourMap = new Map<number, number>();
  records.forEach(r => {
    const hour = new Date(r.timestamp).getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });
  const byHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourMap.get(hour) || 0,
  }));

  return { totalRecords, totalWords, byDomain, byDate, byHour };
}

export async function exportAllData(): Promise<string> {
  const records = await db.records.toArray();
  const tags = await db.tags.toArray();
  const settings = await getSettings();
  return JSON.stringify({ records, tags, settings }, null, 2);
}

export async function clearAllData(): Promise<void> {
  await db.records.clear();
  await db.tags.clear();
  await chrome.storage.local.remove(SETTINGS_KEY);
}
