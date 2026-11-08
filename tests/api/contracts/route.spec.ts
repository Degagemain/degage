import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/contract/search', () => ({
  searchContracts: vi.fn(),
}));

vi.mock('@/actions/contract/create', () => ({
  createContract: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/contracts/route';
import { auth } from '@/auth';
import { searchContracts } from '@/actions/contract/search';
import { createContract } from '@/actions/contract/create';
import { contract } from '../../builders/contract.builder';

describe('API Route - /api/contracts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdminUser = {
    id: 'admin-id',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    banned: false,
  };

  it('returns 401 when no session exists on GET', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await GET({ nextUrl: new URL('http://localhost/api/contracts') } as any);
    expect(response.status).toBe(401);
    expect(searchContracts).not.toHaveBeenCalled();
  });

  it('returns contracts for an admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
    vi.mocked(searchContracts).mockResolvedValueOnce({ records: [contract()], total: 1 });

    const response = await GET({ nextUrl: new URL('http://localhost/api/contracts') } as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.total).toBe(1);
    expect(searchContracts).toHaveBeenCalledTimes(1);
  });

  it('returns 201 when creating a valid contract', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
    const created = contract({ id: 'new-id' });
    vi.mocked(createContract).mockResolvedValueOnce(created);

    const response = await POST({
      json: async () => ({ ...created, id: null }),
    } as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe('new-id');
  });
});
