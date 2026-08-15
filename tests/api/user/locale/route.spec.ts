import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/user/update-locale', () => ({
  updateUserLocale: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

import { PATCH } from '@/api/user/locale/route';
import { auth } from '@/auth';
import { updateUserLocale } from '@/actions/user/update-locale';
import { cookies } from 'next/headers';

const patchRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/user/locale', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('PATCH /api/user/locale', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets the locale cookie and updates the user when authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false },
    } as never);
    vi.mocked(updateUserLocale).mockResolvedValueOnce(undefined);

    const response = await PATCH(patchRequest({ locale: 'en' }));
    const json = await response.json();
    const cookieStore = await cookies();

    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(cookieStore.set).toHaveBeenCalledWith('locale', 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    expect(updateUserLocale).toHaveBeenCalledWith('user-id', 'en');
  });

  it('sets the locale cookie without updating storage when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await PATCH(patchRequest({ locale: 'fr' }));
    const cookieStore = await cookies();

    expect(response.status).toBe(200);
    expect(cookieStore.set).toHaveBeenCalledWith('locale', 'fr', expect.any(Object));
    expect(updateUserLocale).not.toHaveBeenCalled();
  });

  it('returns 400 with code and errors when locale is invalid', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await PATCH(patchRequest({ locale: 'de' }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBeDefined();
    expect(json.errors).toBeDefined();
    expect(updateUserLocale).not.toHaveBeenCalled();
  });
});
