import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/documentation/read', () => ({
  readDocumentation: vi.fn(),
}));

vi.mock('@/actions/documentation/update', () => ({
  updateDocumentation: vi.fn(),
}));

vi.mock('@/actions/documentation/delete', () => ({
  deleteDocumentation: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/documentation/[id]/route';
import { auth } from '@/auth';
import { readDocumentation } from '@/actions/documentation/read';
import { documentation } from '../../builders/documentation.builder';

const docId = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/documentation/[id] (admin role)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdmin = { id: 'a', name: 'A', email: 'a@x.com', role: 'admin', banned: false };
  const mockUser = { id: 'u', name: 'U', email: 'u@x.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const res = await GET({} as any, { params: Promise.resolve({ id: docId }) });
    expect(res.status).toBe(401);
    expect(readDocumentation).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated but not admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const res = await GET({} as any, { params: Promise.resolve({ id: docId }) });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.code).toBe('forbidden');
    expect(readDocumentation).not.toHaveBeenCalled();
  });

  it('returns 200 and body when admin', async () => {
    const doc = documentation({ id: docId });
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdmin } as any);
    vi.mocked(readDocumentation).mockResolvedValueOnce(doc);
    const res = await GET({} as any, { params: Promise.resolve({ id: docId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(docId);
    expect(readDocumentation).toHaveBeenCalledWith(docId);
  });
});
