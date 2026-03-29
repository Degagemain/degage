import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/documentation/search', () => ({
  searchDocumentation: vi.fn(),
}));

vi.mock('@/actions/documentation/create', () => ({
  createDocumentation: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/documentation/route';
import { auth } from '@/auth';
import { searchDocumentation } from '@/actions/documentation/search';
import { createDocumentation } from '@/actions/documentation/create';
import { documentation } from '../../builders/documentation.builder';

describe('API Route /api/documentation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdmin = { id: 'a', name: 'A', email: 'a@x.com', role: 'admin', banned: false };
  const mockUser = { id: 'u', name: 'U', email: 'u@x.com', role: 'user', banned: false };

  it('GET returns 403 for non-admin when isFaq is not true', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const request = { nextUrl: new URL('http://localhost/api/documentation?take=10') } as any;
    const res = await GET(request);
    expect(res.status).toBe(403);
  });

  it('GET returns 403 for anonymous users when isFaq is not true (same as non-admin)', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = { nextUrl: new URL('http://localhost/api/documentation?take=10') } as any;
    const res = await GET(request);
    expect(res.status).toBe(403);
    expect(searchDocumentation).not.toHaveBeenCalled();
  });

  it('GET returns 200 for non-admin FAQ listing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(searchDocumentation).mockResolvedValueOnce({ records: [], total: 0 });
    const request = { nextUrl: new URL('http://localhost/api/documentation?isFaq=true&take=10') } as any;
    const res = await GET(request);
    expect(res.status).toBe(200);
    expect(searchDocumentation).toHaveBeenCalledWith(expect.any(Object), {
      isViewerAdmin: false,
      isAuthenticated: true,
    });
  });

  it('GET uses admin flag for search', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdmin } as any);
    vi.mocked(searchDocumentation).mockResolvedValueOnce({ records: [documentation()], total: 1 });
    const request = { nextUrl: new URL('http://localhost/api/documentation?take=10') } as any;
    const res = await GET(request);
    expect(res.status).toBe(200);
    expect(searchDocumentation).toHaveBeenCalledWith(expect.any(Object), {
      isViewerAdmin: true,
      isAuthenticated: true,
    });
    const json = await res.json();
    expect(json.total).toBe(1);
  });

  it('POST requires admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = new Request('http://localhost/api/documentation', {
      method: 'POST',
      body: JSON.stringify(documentation({ id: null, createdAt: null, updatedAt: null })),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(request as any);
    expect(res.status).toBe(401);
  });

  it('POST returns 403 for authenticated non-admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const request = new Request('http://localhost/api/documentation', {
      method: 'POST',
      body: JSON.stringify(documentation({ id: null, createdAt: null, updatedAt: null })),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(request as any);
    expect(res.status).toBe(403);
    expect(createDocumentation).not.toHaveBeenCalled();
  });
});
