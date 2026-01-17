// Content Script - 输入捕获

import { shouldRecord } from './sensitive-filter';

const DEBOUNCE_DELAY = 2000;
const debounceTimers = new Map<HTMLElement, number>();
let isComposing = false;

function sendRecord(content: string) {
  chrome.runtime.sendMessage({
    type: 'RECORD_INPUT',
    payload: {
      content,
      url: window.location.href,
      domain: window.location.hostname,
      pageTitle: document.title,
      timestamp: Date.now(),
    },
  });
}

function handleInput(event: Event) {
  const target = event.target as HTMLElement;

  if (!(target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable)) {
    return;
  }

  if (target instanceof HTMLInputElement) {
    const type = target.type.toLowerCase();
    if (!['text', 'search', 'url', 'email', 'tel'].includes(type)) {
      return;
    }
  }

  if (isComposing) return;

  const content = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
    ? target.value
    : target.innerText || '';

  if (!content.trim()) return;

  if (!shouldRecord(target, content, window.location.hostname)) return;

  const timer = debounceTimers.get(target);
  if (timer) clearTimeout(timer);

  debounceTimers.set(target, window.setTimeout(() => {
    sendRecord(content);
    debounceTimers.delete(target);
  }, DEBOUNCE_DELAY));
}

function handleCompositionStart() {
  isComposing = true;
}

function handleCompositionEnd(event: CompositionEvent) {
  isComposing = false;
  handleInput(event);
}

async function init() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });

    if (!response?.enabled || !response?.shouldRecord) return;

    document.addEventListener('input', handleInput, true);
    document.addEventListener('compositionstart', handleCompositionStart, true);
    document.addEventListener('compositionend', handleCompositionEnd, true);
  } catch {
    // Extension context may be invalidated
  }
}

init();
