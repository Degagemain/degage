import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/actions/car-info/search', () => ({
  searchCarInfos: vi.fn(),
}));

vi.mock('@/actions/car-info/create', () => ({
  createCarInfo: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/car-infos/route';
import { auth } from '@/auth';
import { searchCarInfos } from '@/actions/car-info/search';
import { createCarInfo } from '@/actions/car-info/create';

const adminUser = { id: 'admin-id', name: 'Admin', email: 'a@example.com', role: 'admin', banned: false };
const regularUser = { id: 'user-id', name: 'User', email: 'u@example.com', role: 'user', banned: false };

const makeRequest = (path = 'http://localhost/api/car-infos') => ({ nextUrl: new URL(path), json: vi.fn() }) as any;

describe('API Route - GET /api/car-infos (admin only)', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await GET(makeRequest());
    expect(response.status).toBe(401);
    expect(searchCarInfos).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated as a regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: regularUser } as any);
    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
    expect(searchCarInfos).not.toHaveBeenCalled();
  });

  it('returns 200 when authenticated as admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    vi.mocked(searchCarInfos).mockResolvedValueOnce({ records: [], total: 0 });
    const response = await GET(makeRequest());
    expect(response.status).toBe(200);
    expect(searchCarInfos).toHaveBeenCalledTimes(1);
  });
});

describe('API Route - POST /api/car-infos (admin only)', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = makeRequest();
    request.json.mockResolvedValue({});
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(createCarInfo).not.toHaveBeenCalled();
  });

  it('returns 403 when authenticated as a regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: regularUser } as any);
    const request = makeRequest();
    request.json.mockResolvedValue({});
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(createCarInfo).not.toHaveBeenCalled();
  });

  it('invokes createCarInfo when authenticated as admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    vi.mocked(createCarInfo).mockResolvedValueOnce({ id: 'new-id' } as any);
    const request = makeRequest();
    request.json.mockResolvedValue({ carType: { id: 'ct-1', name: 'X' }, year: 2023 });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(createCarInfo).toHaveBeenCalledTimes(1);
  });
});
