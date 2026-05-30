import type { BrowserContext } from '@playwright/test';

import { E2E_ADMIN_EMAIL, E2E_PASSWORD, E2E_USER_EMAIL } from '../constants';

const SESSION_COOKIE = 'better-auth.session_token';

type ParsedCookie = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

const parseSetCookie = (header: string): ParsedCookie[] => {
  const cookies: ParsedCookie[] = [];
  for (const part of header.split(/,(?=\s*[^;,]+=)/)) {
    const segments = part.split(';').map((s) => s.trim());
    const [nameValue, ...attrs] = segments;
    const eq = nameValue?.indexOf('=');
    if (eq === undefined || eq < 0) continue;
    const name = nameValue.slice(0, eq).trim();
    const value = nameValue.slice(eq + 1).trim();
    if (!name) continue;
    const cookie: ParsedCookie = {
      name,
      value,
      path: '/',
      httpOnly: attrs.some((a) => a.toLowerCase() === 'httponly'),
      secure: attrs.some((a) => a.toLowerCase() === 'secure'),
      sameSite: 'Lax',
    };
    for (const attr of attrs) {
      const lower = attr.toLowerCase();
      if (lower.startsWith('domain=')) cookie.domain = attr.slice(7).trim();
      if (lower.startsWith('path=')) cookie.path = attr.slice(5).trim();
      if (lower.startsWith('samesite=')) {
        const v = attr.slice(9).trim();
        if (v === 'Strict' || v === 'Lax' || v === 'None') cookie.sameSite = v;
      }
      if (lower.startsWith('max-age=')) {
        const maxAge = Number(attr.slice(8).trim());
        if (!Number.isNaN(maxAge)) cookie.expires = Math.floor(Date.now() / 1000) + maxAge;
      }
    }
    cookies.push(cookie);
  }
  return cookies;
};

export const signInWithEmail = async (
  baseURL: string,
  email: string,
  password: string = E2E_PASSWORD,
): Promise<Array<ParsedCookie & { domain: string; path: string }>> => {
  const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: baseURL,
      Referer: `${baseURL}/app/auth/sign-in`,
    },
    body: JSON.stringify({ email, password, rememberMe: true }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sign-in failed (${response.status}): ${body}`);
  }

  const setCookie = response.headers.getSetCookie?.() ?? [];
  const legacy = response.headers.get('set-cookie');
  const rawHeaders = setCookie.length > 0 ? setCookie : legacy ? [legacy] : [];

  const parsed = rawHeaders.flatMap(parseSetCookie).filter((c) => c.name === SESSION_COOKIE || c.name.startsWith('better-auth'));
  if (parsed.length === 0) {
    throw new Error('Sign-in succeeded but no auth cookies were returned');
  }

  const host = new URL(baseURL).hostname;
  return parsed.map((c) => ({
    ...c,
    domain: c.domain ?? host,
    path: c.path ?? '/',
  }));
};

export const applyAuthCookies = async (context: BrowserContext, baseURL: string, email: string): Promise<void> => {
  const cookies = await signInWithEmail(baseURL, email);
  await context.addCookies(cookies);
};

export const signInAsAdmin = (context: BrowserContext, baseURL: string) => applyAuthCookies(context, baseURL, E2E_ADMIN_EMAIL);

export const signInAsUser = (context: BrowserContext, baseURL: string) => applyAuthCookies(context, baseURL, E2E_USER_EMAIL);
