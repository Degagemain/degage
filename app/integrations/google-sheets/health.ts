import { getGoogleSheetsClient, requireGoogleSheetsCredentialsConfigured } from '@/integrations/google-sheets/client';
import { GoogleSheetsNotConfiguredError, GoogleSheetsUnavailableError } from '@/integrations/google-sheets/errors';

export const assertGoogleSheetsHealthy = async (spreadsheetId: string): Promise<void> => {
  if (!spreadsheetId.trim()) {
    throw new GoogleSheetsNotConfiguredError('Spreadsheet id is not configured');
  }

  requireGoogleSheetsCredentialsConfigured();

  try {
    const client = getGoogleSheetsClient();
    await client.spreadsheets.get({
      spreadsheetId,
      fields: 'spreadsheetId,properties.title',
    });
  } catch (error) {
    if (error instanceof GoogleSheetsNotConfiguredError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown Google Sheets error';
    throw new GoogleSheetsUnavailableError(`Google Sheets health check failed: ${message}`);
  }
};
