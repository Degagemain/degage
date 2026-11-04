import { auth, sheets, type sheets_v4 } from '@googleapis/sheets';

import { loadServiceAccountCredentialsFromEnv } from '@/integrations/gcp-credentials';
import { GoogleSheetsNotConfiguredError } from '@/integrations/google-sheets/errors';

const SPREADSHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

let sheetsClient: sheets_v4.Sheets | null = null;

export const getGoogleSheetsClient = (): sheets_v4.Sheets => {
  if (sheetsClient) {
    return sheetsClient;
  }

  const credentials = loadServiceAccountCredentialsFromEnv('GOOGLE_SHEETS_CREDENTIALS');
  const googleAuth = new auth.GoogleAuth({
    ...(credentials ? { credentials } : {}),
    scopes: [SPREADSHEETS_SCOPE],
  });

  sheetsClient = sheets({
    version: 'v4',
    auth: googleAuth,
  });

  return sheetsClient;
};

export const resetGoogleSheetsClientForTests = (): void => {
  sheetsClient = null;
};

export const requireGoogleSheetsCredentialsConfigured = (): void => {
  const credentials = loadServiceAccountCredentialsFromEnv('GOOGLE_SHEETS_CREDENTIALS');
  if (credentials) {
    return;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    return;
  }
  if (process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT) {
    return;
  }
  throw new GoogleSheetsNotConfiguredError('GOOGLE_SHEETS_CREDENTIALS is not set');
};
