import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/simulation/read', () => ({
  readPublicSimulation: vi.fn(),
  readSimulation: vi.fn(),
}));

vi.mock('@/actions/simulation/update', () => ({
  updateSimulation: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, PUT } from '@/api/simulations/[id]/route';
import { readPublicSimulation, readSimulation } from '@/actions/simulation/read';
import { auth } from '@/auth';
import { updateSimulation } from '@/actions/simulation/update';
import { simulation } from '../../builders/simulation.builder';

const simId = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/simulations/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 without auth and omits email', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    vi.mocked(readPublicSimulation).mockResolvedValueOnce({
      ...simulation({ id: simId, email: 'secret@example.com' }),
      email: null,
      townHasActiveMembers: true,
      townMunicipality: 'Test Municipality',
    });
    const res = await GET({} as any, { params: Promise.resolve({ id: simId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe(simId);
    expect(json.email).toBeNull();
    expect(json.townHasActiveMembers).toBe(true);
    expect(readPublicSimulation).toHaveBeenCalledWith(simId);
  });

  it('returns full simulation including email when authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
    vi.mocked(readSimulation).mockResolvedValueOnce(simulation({ id: simId, email: 'admin@example.com' }));
    const res = await GET({} as any, { params: Promise.resolve({ id: simId }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.email).toBe('admin@example.com');
    expect(readSimulation).toHaveBeenCalledWith(simId);
    expect(readPublicSimulation).not.toHaveBeenCalled();
  });
});

describe('PUT /api/simulations/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-1', name: 'User', email: 'u@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = {
      json: vi.fn().mockResolvedValue({ id: simId, email: 'a@b.co' }),
    } as any;
    const res = await PUT(request, { params: Promise.resolve({ id: simId }) });
    expect(res.status).toBe(401);
    expect(updateSimulation).not.toHaveBeenCalled();
  });

  it('returns 204 when body id matches route id', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(updateSimulation).mockResolvedValueOnce({ id: simId, email: 'a@b.co' });
    const request = {
      json: vi.fn().mockResolvedValue({ id: simId, email: 'a@b.co' }),
    } as any;
    const res = await PUT(request, { params: Promise.resolve({ id: simId }) });
    expect(res.status).toBe(204);
    expect(updateSimulation).toHaveBeenCalledWith({ id: simId, email: 'a@b.co' });
  });

  it('returns 400 when id in body does not match path', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
    const otherId = '660e8400-e29b-41d4-a716-446655440000';
    const request = {
      json: vi.fn().mockResolvedValue({ id: otherId, email: 'a@b.co' }),
    } as any;
    const res = await PUT(request, { params: Promise.resolve({ id: simId }) });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('id_mismatch');
    expect(updateSimulation).not.toHaveBeenCalled();
  });
});
