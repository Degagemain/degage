import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { AuthedRouteHandler, PublicRouteHandler } from '@/api/with-context';

vi.mock('@/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { withAdmin, withAuth, withPublic } from '@/api/with-context';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { getRequestContentLocale, getRequestLocale, getRequestUserId } from '@/context/request-context';

const mockAdmin = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

const makeRequest = (url = 'http://localhost/api/test') => new NextRequest(url);

const publicHandler = () => vi.fn<PublicRouteHandler>(async () => Response.json({ ok: true }));
const authedHandler = () => vi.fn<AuthedRouteHandler>(async () => Response.json({ ok: true }));

describe('API auth wrappers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('withPublic', () => {
    it('invokes the handler with a null session when unauthenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
      const handler = publicHandler();

      const response = await withPublic(handler)(makeRequest(), undefined);

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][2]).toBeNull();
    });

    it('forwards the session to the handler when authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
      const handler = publicHandler();

      await withPublic(handler)(makeRequest(), undefined);

      expect(handler.mock.calls[0][2]).toEqual({ user: mockUser });
    });
  });

  describe('withAuth', () => {
    it('returns 401 with unauthorized code when no session', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
      const handler = authedHandler();

      const response = await withAuth(handler)(makeRequest(), undefined);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(handler).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);
      const handler = authedHandler();

      const response = await withAuth(handler)(makeRequest(), undefined);

      expect(response.status).toBe(401);
      expect(handler).not.toHaveBeenCalled();
    });

    it('invokes the handler with a non-null session for a regular user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
      const handler = authedHandler();

      const response = await withAuth(handler)(makeRequest(), undefined);

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][2]).toEqual({ user: mockUser });
    });

    it('invokes the handler for an admin user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as any);
      const handler = authedHandler();

      const response = await withAuth(handler)(makeRequest(), undefined);

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('withAdmin', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
      const handler = authedHandler();

      const response = await withAdmin(handler)(makeRequest(), undefined);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(handler).not.toHaveBeenCalled();
    });

    it('returns 403 when authenticated but not admin', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
      const handler = authedHandler();

      const response = await withAdmin(handler)(makeRequest(), undefined);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(handler).not.toHaveBeenCalled();
    });

    it('invokes the handler for an admin user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as any);
      const handler = authedHandler();

      const response = await withAdmin(handler)(makeRequest(), undefined);

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][2]?.user.role).toBe('admin');
    });
  });

  describe('request context propagation', () => {
    beforeEach(() => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    });

    it('exposes the authenticated user id in the AsyncLocalStorage context', async () => {
      let observedUserId: string | undefined;
      await withAuth(async () => {
        observedUserId = getRequestUserId();
        return Response.json({});
      })(makeRequest(), undefined);

      expect(observedUserId).toBe(mockUser.id);
    });

    it('reads the locale from the cookie when present and valid', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({ get: () => ({ value: 'fr' }) } as any);

      let observedLocale: string | undefined;
      let observedContentLocale: string | undefined;
      await withPublic(async () => {
        observedLocale = getRequestLocale();
        observedContentLocale = getRequestContentLocale();
        return Response.json({});
      })(makeRequest(), undefined);

      expect(observedLocale).toBe('fr');
      expect(observedContentLocale).toBeDefined();
    });

    it('falls back to the default locale when cookie is missing', async () => {
      let observedLocale: string | undefined;
      await withPublic(async () => {
        observedLocale = getRequestLocale();
        return Response.json({});
      })(makeRequest(), undefined);

      expect(observedLocale).toBeDefined();
    });

    it('ignores an invalid cookie locale value', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({ get: () => ({ value: 'xx' }) } as any);

      let observedLocale: string | undefined;
      await withPublic(async () => {
        observedLocale = getRequestLocale();
        return Response.json({});
      })(makeRequest(), undefined);

      expect(observedLocale).not.toBe('xx');
    });
  });
});
