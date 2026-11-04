import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { getCarOnboardingGsheetSpreadsheetId } from '@/actions/car-onboarding/gsheet/config';
import { syncCarOnboardingGsheetRow } from '@/actions/car-onboarding/gsheet/sync';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { assertGoogleSheetsHealthy } from '@/integrations/google-sheets/health';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';

export const syncCarOnboardingGsheet = async (id: string, caller: UserWithRole) => {
  if (!isAdmin(caller)) {
    throw new CarOnboardingForbiddenError();
  }

  const spreadsheetId = getCarOnboardingGsheetSpreadsheetId();
  await assertGoogleSheetsHealthy(spreadsheetId);

  const existing = await readCarOnboarding(id);
  const gsheetRowNumber = await syncCarOnboardingGsheetRow(existing, spreadsheetId);

  if (existing.gsheetRowNumber !== gsheetRowNumber) {
    await dbCarOnboardingUpdate({ ...existing, gsheetRowNumber });
  }

  return readCarOnboarding(id);
};
