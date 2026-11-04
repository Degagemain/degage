import { GoogleSheetsNotConfiguredError } from '@/integrations/google-sheets/errors';

export const getCarOnboardingGsheetSpreadsheetId = (): string => {
  const spreadsheetId = process.env.GOOGLE_SHEETS_CAR_ONBOARDING_SPREADSHEET_ID?.trim() ?? '';
  if (!spreadsheetId) {
    throw new GoogleSheetsNotConfiguredError('GOOGLE_SHEETS_CAR_ONBOARDING_SPREADSHEET_ID is not set');
  }
  return spreadsheetId;
};

export const getCarOnboardingGsheetSheetName = (): string | undefined => {
  const sheetName = process.env.GOOGLE_SHEETS_CAR_ONBOARDING_SHEET_NAME?.trim() ?? '';
  return sheetName || undefined;
};
