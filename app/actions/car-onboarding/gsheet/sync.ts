import type { CarOnboarding } from '@/domain/car-onboarding.model';
import { getCarOnboardingGsheetSheetName } from '@/actions/car-onboarding/gsheet/config';
import { mapCarOnboardingToGsheetRow } from '@/actions/car-onboarding/gsheet/map-row';
import { CarOnboardingGsheetMissingDataError } from '@/actions/car-onboarding/gsheet/mapping.error';
import { readSimulation } from '@/actions/simulation/read';
import { upsertRowByHeaders } from '@/integrations/google-sheets/upsert';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbHubRead } from '@/storage/hub/hub.read';
import { dbTownRead } from '@/storage/town/town.read';
import { dbUserRead } from '@/storage/user/user.read';

export const syncCarOnboardingGsheetRow = async (onboarding: CarOnboarding, spreadsheetId: string): Promise<number> => {
  const sheetName = getCarOnboardingGsheetSheetName();
  if (onboarding.simulation?.id == null) {
    throw new CarOnboardingGsheetMissingDataError('Car onboarding has no linked simulation');
  }
  if (onboarding.town?.id == null) {
    throw new CarOnboardingGsheetMissingDataError('Car onboarding has no town');
  }
  if (onboarding.fuelType?.id == null) {
    throw new CarOnboardingGsheetMissingDataError('Car onboarding has no fuel type');
  }
  if (onboarding.owner?.id == null) {
    throw new CarOnboardingGsheetMissingDataError('Car onboarding has no owner');
  }

  const [simulation, town, fuelType, owner] = await Promise.all([
    readSimulation(onboarding.simulation.id),
    dbTownRead(onboarding.town.id),
    dbFuelTypeRead(onboarding.fuelType.id),
    dbUserRead(onboarding.owner.id),
  ]);
  const hub = await dbHubRead(town.hub.id);

  const buildValues = (rowNumber: number | null) =>
    mapCarOnboardingToGsheetRow({
      onboarding,
      simulation,
      town,
      hub,
      fuelCode: fuelType.code,
      ownerName: owner.name?.trim() || onboarding.owner?.name?.trim() || '',
      ownerEmail: owner.email,
      rowNumber,
    });

  const existingRowNumber = onboarding.gsheetRowNumber;
  if (existingRowNumber != null) {
    await upsertRowByHeaders({
      spreadsheetId,
      sheetName,
      rowNumber: existingRowNumber,
      valuesByHeader: buildValues(existingRowNumber),
    });
    return existingRowNumber;
  }

  const appendedRowNumber = await upsertRowByHeaders({
    spreadsheetId,
    sheetName,
    rowNumber: null,
    valuesByHeader: buildValues(null),
  });

  await upsertRowByHeaders({
    spreadsheetId,
    sheetName,
    rowNumber: appendedRowNumber,
    valuesByHeader: buildValues(appendedRowNumber),
  });

  return appendedRowNumber;
};
