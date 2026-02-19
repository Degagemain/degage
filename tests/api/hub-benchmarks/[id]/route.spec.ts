import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/hub-benchmark/read', () => ({
  readHubBenchmark: vi.fn(),
}));

vi.mock('@/actions/hub-benchmark/update', () => ({
  updateHubBenchmark: vi.fn(),
}));

vi.mock('@/actions/hub-benchmark/delete', () => ({
  deleteHubBenchmark: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/hub-benchmarks/[id]/route';
import { auth } from '@/auth';
import { readHubBenchmark } from '@/actions/hub-benchmark/read';
import { updateHubBenchmark } from '@/actions/hub-benchmark/update';
import { deleteHubBenchmark } from '@/actions/hub-benchmark/delete';
import { hubBenchmark } from '../../../builders/hub-benchmark.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';
const mockAdminUser = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
const mockRegularUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

describe('GET /api/hub-benchmarks/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = {} as any;
    const route = { params: Promise.resolve({ id: validId }) };
    const response = await GET(request, route);
    expect(response.status).toBe(401);
    expect(readHubBenchmark).not.toHaveBeenCalled();
  });

  it('returns 200 when authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
    vi.mocked(readHubBenchmark).mockResolvedValueOnce(hubBenchmark({ id: validId }));
    const request = {} as any;
    const route = { params: Promise.resolve({ id: validId }) };
    const response = await GET(request, route);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.id).toBe(validId);
  });
});

describe('PUT /api/hub-benchmarks/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const updateBody = {
    id: validId,
    hubId: '550e8400-e29b-41d4-a716-446655440099',
    ownerKm: 15_000,
    sharedMinKm: 3_000,
    sharedMaxKm: 7_000,
    sharedAvgKm: 5_000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('returns 403 when regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
    const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
    const route = { params: Promise.resolve({ id: validId }) };
    const response = await PUT(request, route);
    expect(response.status).toBe(403);
    expect(updateHubBenchmark).not.toHaveBeenCalled();
  });

  it('returns 204 when admin updates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
    vi.mocked(updateHubBenchmark).mockResolvedValueOnce(hubBenchmark(updateBody));
    const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
    const route = { params: Promise.resolve({ id: validId }) };
    const response = await PUT(request, route);
    expect(response.status).toBe(204);
    expect(updateHubBenchmark).toHaveBeenCalledTimes(1);
  });
});

describe('DELETE /api/hub-benchmarks/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
    const request = {} as any;
    const route = { params: Promise.resolve({ id: validId }) };
    const response = await DELETE(request, route);
    expect(response.status).toBe(403);
    expect(deleteHubBenchmark).not.toHaveBeenCalled();
  });

  it('returns 204 when admin deletes', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
    vi.mocked(deleteHubBenchmark).mockResolvedValueOnce(undefined);
    const request = {} as any;
    const route = { params: Promise.resolve({ id: validId }) };
    const response = await DELETE(request, route);
    expect(response.status).toBe(204);
    expect(deleteHubBenchmark).toHaveBeenCalledWith(validId);
  });
});
