import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/sync-autofiche', () => ({
  syncCarOnboardingAutofiche: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/car-onboardings/[id]/autofiche/sync/route';
import { auth } from '@/auth';
import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingPlayConnectorMissingError } from '@/actions/car-onboarding/car-onboarding-play-connector-missing.error';
import { syncCarOnboardingAutofiche } from '@/actions/car-onboarding/sync-autofiche';
import { completeCarOnboarding } from '../../../../builders/car-onboarding.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/autofiche/sync', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdmin = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(syncCarOnboardingAutofiche).not.toHaveBeenCalled();
  });

  it('returns 403 when user is not admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as never);
    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
    expect(syncCarOnboardingAutofiche).not.toHaveBeenCalled();
  });

  it('returns the updated onboarding when sync succeeds', async () => {
    const onboarding = completeCarOnboarding({ id: validId, carPcId: 3961 });
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingAutofiche).mockResolvedValueOnce(onboarding);

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(JSON.parse(JSON.stringify(onboarding)));
    expect(syncCarOnboardingAutofiche).toHaveBeenCalledWith(validId, mockAdmin);
  });

  it('returns 400 when the play connector is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingAutofiche).mockRejectedValueOnce(new CarOnboardingPlayConnectorMissingError());

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'play_connector_missing' });
  });

  it('returns 503 when admin mode is unavailable', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingAutofiche).mockRejectedValueOnce(new CarOnboardingAdminModeUnavailableError());

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(503);
  });

  it('returns 403 when the action rejects a non-admin caller', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingAutofiche).mockRejectedValueOnce(new CarOnboardingForbiddenError());

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
  });
});
