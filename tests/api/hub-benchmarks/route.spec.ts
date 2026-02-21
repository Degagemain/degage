import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/hub-benchmark/search', () => ({
  searchHubBenchmarks: vi.fn(),
}));

vi.mock('@/actions/hub-benchmark/create', () => ({
  createHubBenchmark: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/hub-benchmarks/route';
import { auth } from '@/auth';
import { searchHubBenchmarks } from '@/actions/hub-benchmark/search';
import { createHubBenchmark } from '@/actions/hub-benchmark/create';
import { hubBenchmark } from '../../builders/hub-benchmark.builder';

const mockAdminUser = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
const mockRegularUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

describe('GET /api/hub-benchmarks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = { nextUrl: new URL('http://localhost/api/hub-benchmarks') } as any;
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(searchHubBenchmarks).not.toHaveBeenCalled();
  });

  it('returns 403 when regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
    const request = { nextUrl: new URL('http://localhost/api/hub-benchmarks') } as any;
    const response = await GET(request);
    expect(response.status).toBe(403);
    expect(searchHubBenchmarks).not.toHaveBeenCalled();
  });

  it('returns 200 and list when admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
    vi.mocked(searchHubBenchmarks).mockResolvedValueOnce({
      records: [hubBenchmark()],
      total: 1,
    });
    const request = { nextUrl: new URL('http://localhost/api/hub-benchmarks') } as any;
    const response = await GET(request);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.records).toHaveLength(1);
    expect(json.total).toBe(1);
  });
});

describe('POST /api/hub-benchmarks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    id: null,
    hubId: '550e8400-e29b-41d4-a716-446655440099',
    ownerKm: 10_000,
    sharedMinKm: 2_000,
    sharedMaxKm: 5_000,
    sharedAvgKm: 3_500,
    createdAt: null,
    updatedAt: null,
  };

  it('returns 401 when no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = { json: vi.fn().mockResolvedValue(validBody) } as any;
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(createHubBenchmark).not.toHaveBeenCalled();
  });

  it('returns 403 when regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
    const request = { json: vi.fn().mockResolvedValue(validBody) } as any;
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(createHubBenchmark).not.toHaveBeenCalled();
  });

  it('returns 201 when admin creates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
    const created = hubBenchmark({ id: 'new-id' });
    vi.mocked(createHubBenchmark).mockResolvedValueOnce(created);
    const request = { json: vi.fn().mockResolvedValue(validBody) } as any;
    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.id).toBe('new-id');
  });
});
