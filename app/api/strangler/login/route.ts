import { type NextRequest } from 'next/server';
import { statusCodes } from '@/api/status-codes';

const DEGAPP_LOGIN_URL = 'https://degapp.be/login';

interface ParsedCookie {
  name: string;
  value: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  expires?: string;
  sameSite?: string;
}

function parseSetCookieHeader(header: string): ParsedCookie {
  const parts = header.split(';').map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eqIndex = nameValue.indexOf('=');
  const name = eqIndex === -1 ? nameValue : nameValue.slice(0, eqIndex).trim();
  let value = eqIndex === -1 ? '' : nameValue.slice(eqIndex + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }

  const parsed: ParsedCookie = { name, value };

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
    if (key === 'expires') parsed.expires = val;
    if (key === 'samesite') parsed.sameSite = val;
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return Response.json(
        { code: 'validation_error', errors: [{ message: 'email and password are required' }] },
        { status: statusCodes.BAD_REQUEST },
      );
    }

    const formBody = new URLSearchParams({
      email: String(email),
      password: String(password),
    }).toString();

    const loginResponse = await fetch(DEGAPP_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
      redirect: 'manual',
    });

    const setCookieHeaders = loginResponse.headers.getSetCookie?.() ?? [];
    const parsedCookies = setCookieHeaders.map(parseSetCookieHeader);

    return Response.json({
      cookies: parsedCookies,
      status: loginResponse.status,
    });
  } catch (error) {
    console.error('[strangler/login]', error);
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'Login proxy failed' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
