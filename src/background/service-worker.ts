// Background Service Worker

import { addRecord, getSettings } from '../utils/storage';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true;
});

async function handleMessage(message: { type: string; payload?: unknown }, sender: chrome.runtime.MessageSender) {
  switch (message.type) {
    case 'RECORD_INPUT': {
      const payload = message.payload as {
        content: string;
        url: string;
        domain: string;
        pageTitle: string;
        timestamp: number;
      };
      await addRecord({
        content: payload.content,
        url: payload.url,
        domain: payload.domain,
        pageTitle: payload.pageTitle,
        timestamp: payload.timestamp,
        starred: false,
        tags: [],
        deleted: false,
      });
      return { success: true };
    }

    case 'GET_STATUS': {
      const settings = await getSettings();

      // 使用 sender.tab 获取发送消息的 tab
      const tabUrl = sender.tab?.url || sender.url || '';
      let shouldRecord = false;

      if (settings.enabled && tabUrl) {
        try {
          const url = new URL(tabUrl);
          const domain = url.hostname;

          const inBlacklist = settings.blacklistDomains.some(d =>
            domain.includes(d) || d.includes(domain)
          );
          if (inBlacklist) {
            shouldRecord = false;
          } else if (settings.whitelistDomains.length === 0) {
            shouldRecord = true;
          } else {
            shouldRecord = settings.whitelistDomains.some(d =>
              domain.includes(d) || d.includes(domain)
            );
          }
        } catch {
          shouldRecord = false;
        }
      }

      return { enabled: settings.enabled, shouldRecord };
    }

    default:
      return { error: 'Unknown message type' };
  }
}

async function updateIcon() {
  const settings = await getSettings();
  const iconPath = settings.enabled
    ? { 16: 'public/icons/icon16.png', 48: 'public/icons/icon48.png', 128: 'public/icons/icon128.png' }
    : { 16: 'public/icons/icon16-disabled.png', 48: 'public/icons/icon48-disabled.png', 128: 'public/icons/icon128-disabled.png' };
  chrome.action.setIcon({ path: iconPath });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.settings) {
    updateIcon();
  }
});

updateIcon();
