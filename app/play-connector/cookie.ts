export type ParsedPlayCookie = {
  name: string;
  value: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  expires?: Date;
  sameSite?: string;
};

export const parseSetCookieHeader = (header: string): ParsedPlayCookie => {
  const parts = header.split(';').map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eqIndex = nameValue.indexOf('=');
  const name = eqIndex === -1 ? nameValue : nameValue.slice(0, eqIndex).trim();
  let value = eqIndex === -1 ? '' : nameValue.slice(eqIndex + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }

  const parsed: ParsedPlayCookie = { name, value };

  for (const attr of attrs) {
    const attrEq = attr.indexOf('=');
    if (attrEq === -1) {
      const lower = attr.toLowerCase();
      if (lower === 'httponly') parsed.httpOnly = true;
      if (lower === 'secure') parsed.secure = true;
      continue;
    }
    const key = attr.slice(0, attrEq).trim().toLowerCase();
    const val = attr.slice(attrEq + 1).trim();
    if (key === 'path') parsed.path = val;
    if (key === 'max-age') parsed.maxAge = parseInt(val, 10);
    if (key === 'expires') {
      const expires = new Date(val);
      if (!Number.isNaN(expires.getTime())) parsed.expires = expires;
    }
    if (key === 'samesite') parsed.sameSite = val;
  }

  return parsed;
};

export const parseSetCookieHeaders = (headers: string[]): ParsedPlayCookie[] => headers.map(parseSetCookieHeader);

export const buildCookieHeader = (cookies: ParsedPlayCookie[]): string => cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');

export const parseCookieHeader = (cookieHeader: string): ParsedPlayCookie[] => {
  if (!cookieHeader.trim()) {
    return [];
  }

  return cookieHeader.split(';').map((part) => {
    const trimmed = part.trim();
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      return { name: trimmed, value: '' };
    }
    return {
      name: trimmed.slice(0, eqIndex).trim(),
      value: trimmed.slice(eqIndex + 1).trim(),
    };
  });
};

export const mergeSetCookiesIntoHeader = (cookieHeader: string, setCookieHeaders: string[]): string => {
  const byName = new Map<string, string>();
  for (const cookie of parseCookieHeader(cookieHeader)) {
    byName.set(cookie.name, cookie.value);
  }
  for (const cookie of parseSetCookieHeaders(setCookieHeaders)) {
    byName.set(cookie.name, cookie.value);
  }
  return buildCookieHeader([...byName.entries()].map(([name, value]) => ({ name, value })));
};

export const computeSessionExpiry = (cookies: ParsedPlayCookie[]): Date | null => {
  const expiries = cookies
    .map((cookie) => {
      if (cookie.maxAge !== undefined && !Number.isNaN(cookie.maxAge)) {
        return new Date(Date.now() + cookie.maxAge * 1000);
      }
      return cookie.expires ?? null;
    })
    .filter((date): date is Date => date !== null);

  if (expiries.length === 0) return null;

  return expiries.reduce((earliest, current) => (current.getTime() < earliest.getTime() ? current : earliest));
};
