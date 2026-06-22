import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/create', () => ({
  createCarOnboarding: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { POST } from '@/api/car-onboardings/route';
import { auth } from '@/auth';
import { createCarOnboarding } from '@/actions/car-onboarding/create';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { carOnboarding } from '../../builders/car-onboarding.builder';

describe('POST /api/car-onboardings', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };
  const mockAdmin = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
  const simulationId = '550e8400-e29b-41d4-a716-446655440010';

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const request = { json: vi.fn().mockResolvedValue({}) } as any;
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(createCarOnboarding).not.toHaveBeenCalled();
  });

  it('returns 403 when regular user creates without simulation', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(createCarOnboarding).mockRejectedValueOnce(new CarOnboardingForbiddenError());

    const request = { json: vi.fn().mockResolvedValue({}) } as any;
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.code).toBe('forbidden');
    expect(createCarOnboarding).toHaveBeenCalledWith({}, mockUser);
  });

  it('returns 201 when admin creates empty shell', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as any);
    const created = carOnboarding({ id: 'new-id' });
    vi.mocked(createCarOnboarding).mockResolvedValueOnce(created);

    const request = { json: vi.fn().mockResolvedValue({}) } as any;
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe('new-id');
    expect(createCarOnboarding).toHaveBeenCalledWith({}, mockAdmin);
  });

  it('returns 201 when user creates from simulation', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    const created = carOnboarding({ id: 'new-id', simulation: { id: simulationId, name: 'categoryA' } });
    vi.mocked(createCarOnboarding).mockResolvedValueOnce(created);

    const body = { simulation: { id: simulationId } };
    const request = { json: vi.fn().mockResolvedValue(body) } as any;
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.id).toBe('new-id');
    expect(createCarOnboarding).toHaveBeenCalledWith(body, mockUser);
  });

  it('returns 400 for invalid body', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);

    const request = { json: vi.fn().mockResolvedValue({ simulation: 'invalid' }) } as any;
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(createCarOnboarding).not.toHaveBeenCalled();
  });

  it('returns 404 when simulation is not found', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(createCarOnboarding).mockRejectedValueOnce({ code: 'P2025' });

    const request = { json: vi.fn().mockResolvedValue({ simulation: { id: simulationId } }) } as any;
    const response = await POST(request);

    expect(response.status).toBe(404);
  });
});
