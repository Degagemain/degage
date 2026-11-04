import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.update', () => ({
  dbCarOnboardingUpdate: vi.fn(),
}));

vi.mock('@/integrations/google-sheets/health', () => ({
  assertGoogleSheetsHealthy: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/gsheet/sync', () => ({
  syncCarOnboardingGsheetRow: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/gsheet/config', () => ({
  getCarOnboardingGsheetSpreadsheetId: vi.fn(() => 'spreadsheet-id'),
}));

import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { syncCarOnboardingGsheetRow } from '@/actions/car-onboarding/gsheet/sync';
import { syncCarOnboardingGsheet } from '@/actions/car-onboarding/sync-gsheet';
import { assertGoogleSheetsHealthy } from '@/integrations/google-sheets/health';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';
import { completeCarOnboarding } from '../../builders/car-onboarding.builder';

const id = '550e8400-e29b-41d4-a716-446655440000';
const admin = { id: 'admin-1', role: 'admin', banned: false };
const user = { id: 'user-1', role: 'user', banned: false };

describe('syncCarOnboardingGsheet', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws when caller is not admin', async () => {
    await expect(syncCarOnboardingGsheet(id, user)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(assertGoogleSheetsHealthy).not.toHaveBeenCalled();
  });

  it('checks health, syncs the row, and persists a new row number', async () => {
    const existing = completeCarOnboarding({ id, gsheetRowNumber: null });
    const updated = { ...existing, gsheetRowNumber: 15 };
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(existing).mockResolvedValueOnce(updated);
    vi.mocked(syncCarOnboardingGsheetRow).mockResolvedValueOnce(15);
    vi.mocked(dbCarOnboardingUpdate).mockResolvedValueOnce(updated);

    await expect(syncCarOnboardingGsheet(id, admin)).resolves.toEqual(updated);

    expect(assertGoogleSheetsHealthy).toHaveBeenCalledWith('spreadsheet-id');
    expect(syncCarOnboardingGsheetRow).toHaveBeenCalledWith(existing, 'spreadsheet-id');
    expect(dbCarOnboardingUpdate).toHaveBeenCalledWith({ ...existing, gsheetRowNumber: 15 });
  });

  it('skips update when the row number is unchanged', async () => {
    const existing = completeCarOnboarding({ id, gsheetRowNumber: 12 });
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
    vi.mocked(syncCarOnboardingGsheetRow).mockResolvedValueOnce(12);

    await expect(syncCarOnboardingGsheet(id, admin)).resolves.toEqual(existing);
    expect(dbCarOnboardingUpdate).not.toHaveBeenCalled();
  });
});
