import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-onboarding/sync-gsheet', () => ({
  syncCarOnboardingGsheet: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/car-onboardings/[id]/gsheet/sync/route';
import { auth } from '@/auth';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingGsheetMissingDataError } from '@/actions/car-onboarding/gsheet/mapping.error';
import { syncCarOnboardingGsheet } from '@/actions/car-onboarding/sync-gsheet';
import { GoogleSheetsNotConfiguredError } from '@/integrations/google-sheets/errors';
import { completeCarOnboarding } from '../../../../builders/car-onboarding.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('PUT /api/car-onboardings/[id]/gsheet/sync', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdmin = { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin', banned: false };
  const mockUser = { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user', banned: false };

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(401);
    expect(syncCarOnboardingGsheet).not.toHaveBeenCalled();
  });

  it('returns 403 when user is not admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as never);
    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
    expect(syncCarOnboardingGsheet).not.toHaveBeenCalled();
  });

  it('returns the updated onboarding when sync succeeds', async () => {
    const onboarding = completeCarOnboarding({ id: validId, gsheetRowNumber: 15 });
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingGsheet).mockResolvedValueOnce(onboarding);

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(JSON.parse(JSON.stringify(onboarding)));
    expect(syncCarOnboardingGsheet).toHaveBeenCalledWith(validId, mockAdmin);
  });

  it('returns 400 when mapping data is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingGsheet).mockRejectedValueOnce(new CarOnboardingGsheetMissingDataError('no simulation'));

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'car_onboarding_gsheet_missing_data' });
  });

  it('returns 503 when Google Sheets is not configured', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingGsheet).mockRejectedValueOnce(new GoogleSheetsNotConfiguredError());

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(503);
  });

  it('returns 403 when the action rejects a non-admin caller', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdmin } as never);
    vi.mocked(syncCarOnboardingGsheet).mockRejectedValueOnce(new CarOnboardingForbiddenError());

    const response = await PUT({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
  });
});
