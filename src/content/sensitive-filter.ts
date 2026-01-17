// 敏感信息过滤模块

// 敏感字段名关键词
const SENSITIVE_FIELD_KEYWORDS = [
  'password', 'passwd', 'pwd', 'pass',
  'secret', 'token', 'apikey', 'api_key', 'api-key',
  'card', 'credit', 'debit', 'cvv', 'cvc', 'ccv',
  'ssn', 'social',
  'otp', 'verification', 'verify', 'code',
  'pin', 'security',
];

// 预设敏感站点
const SENSITIVE_DOMAINS = [
  // 银行
  'bank', 'banking', 'chase', 'wellsfargo', 'citi', 'bofa',
  'icbc', 'ccb', 'boc', 'abc', 'cmb', 'spdb',
  // 支付
  'paypal', 'stripe', 'alipay', 'wechatpay', 'venmo',
  // 医疗
  'hospital', 'medical', 'health', 'clinic',
  // 政府
  'gov', 'irs', 'ssa',
];

// 银行卡号正则（16位数字，可能有空格或横线分隔）
const CARD_NUMBER_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/;

// 中国身份证号正则（18位）
const ID_CARD_REGEX = /\b\d{17}[\dXx]\b/;

// 验证码正则（4-6位纯数字）
const OTP_REGEX = /^\d{4,6}$/;

/**
 * 检查输入框是否应该被忽略（敏感字段）
 */
export function isSensitiveField(element: HTMLInputElement | HTMLTextAreaElement): boolean {
  // 1. 检查 type
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    if (type === 'password' || type === 'hidden') {
      return true;
    }
  }

  // 2. 检查字段名称
  const name = (element.name || '').toLowerCase();
  const id = (element.id || '').toLowerCase();
  const placeholder = (element.placeholder || '').toLowerCase();
  const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();

  const allText = `${name} ${id} ${placeholder} ${autocomplete}`;

  for (const keyword of SENSITIVE_FIELD_KEYWORDS) {
    if (allText.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * 检查当前域名是否为敏感站点
 */
export function isSensitiveDomain(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return SENSITIVE_DOMAINS.some(domain => lower.includes(domain));
}

/**
 * 检查内容是否包含敏感格式（银行卡号、身份证号等）
 */
export function containsSensitiveContent(content: string): boolean {
  // 银行卡号
  if (CARD_NUMBER_REGEX.test(content)) {
    return true;
  }

  // 身份证号
  if (ID_CARD_REGEX.test(content)) {
    return true;
  }

  // 纯数字验证码（只有当整个内容就是验证码时才过滤）
  if (OTP_REGEX.test(content.trim())) {
    return true;
  }

  return false;
}

/**
 * 综合检查是否应该记录
 */
export function shouldRecord(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
  content: string,
  hostname: string
): boolean {
  // 1. 检查域名
  if (isSensitiveDomain(hostname)) {
    return false;
  }

  // 2. 检查字段
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (isSensitiveField(element)) {
      return false;
    }
  }

  // 3. 检查内容
  if (containsSensitiveContent(content)) {
    return false;
  }

  // 4. 内容太短不记录（至少5个字符）
  if (content.trim().length < 5) {
    return false;
  }

  return true;
}
