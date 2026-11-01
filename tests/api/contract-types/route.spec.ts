import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/contract-type/search', () => ({
  searchContractTypes: vi.fn(),
}));

vi.mock('@/actions/contract-type/create', () => ({
  createContractType: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/contract-types/route';
import { auth } from '@/auth';
import { searchContractTypes } from '@/actions/contract-type/search';
import { createContractType } from '@/actions/contract-type/create';
import { contractType } from '../../builders/contract-type.builder';

describe('API Route - /api/contract-types', () => {
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
    const response = await GET({ nextUrl: new URL('http://localhost/api/contract-types') } as any);
    expect(response.status).toBe(401);
    expect(searchContractTypes).not.toHaveBeenCalled();
  });

  it('returns contract types for an admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
    vi.mocked(searchContractTypes).mockResolvedValueOnce({ records: [contractType()], total: 1 });

    const response = await GET({ nextUrl: new URL('http://localhost/api/contract-types') } as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.total).toBe(1);
  });

  it('returns 201 when creating a valid contract type', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
    const created = contractType({ id: 'new-id' });
    vi.mocked(createContractType).mockResolvedValueOnce(created);

    const response = await POST({
      json: async () => ({ ...created, id: null }),
    } as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe('new-id');
  });
});
