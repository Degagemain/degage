import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/simulation/search', () => ({
  searchSimulations: vi.fn(),
}));

vi.mock('@/actions/simulation/create', () => ({
  createSimulation: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/simulations/route';
import { auth } from '@/auth';
import { searchSimulations } from '@/actions/simulation/search';
import { createSimulation } from '@/actions/simulation/create';
import { simulation, simulationRunInput } from '../../builders/simulation.builder';

const mockUser = { id: 'user-1', name: 'User', email: 'u@example.com', role: 'user', banned: false };

describe('GET /api/simulations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = { nextUrl: new URL('http://localhost/api/simulations') } as any;
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(searchSimulations).not.toHaveBeenCalled();
  });

  it('returns 200 and list when authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(searchSimulations).mockResolvedValueOnce({
      records: [simulation()],
      total: 1,
    });
    const request = { nextUrl: new URL('http://localhost/api/simulations') } as any;
    const response = await GET(request);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.records).toHaveLength(1);
    expect(json.total).toBe(1);
    expect(searchSimulations).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/simulations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const validBody = simulationRunInput();

  it('returns 401 when no session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = { json: vi.fn().mockResolvedValue(validBody) } as any;
    const response = await POST(request);
    expect(response.status).toBe(401);
    expect(createSimulation).not.toHaveBeenCalled();
  });

  it('returns 201 and created simulation when valid body', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const created = simulation({ id: 'new-id' });
    vi.mocked(createSimulation).mockResolvedValueOnce(created);
    const request = { json: vi.fn().mockResolvedValue(validBody) } as any;
    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.id).toBe('new-id');
    expect(createSimulation).toHaveBeenCalledTimes(1);
    expect(createSimulation).toHaveBeenCalledWith(validBody);
  });

  it('returns 400 when validation fails', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const request = { json: vi.fn().mockResolvedValue({ ...validBody, km: -1 }) } as any;
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(createSimulation).not.toHaveBeenCalled();
  });
});
