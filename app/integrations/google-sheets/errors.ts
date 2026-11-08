import { AppError } from '@/actions/app.error';

export class GoogleSheetsNotConfiguredError extends AppError {
  constructor(message = 'Google Sheets is not configured') {
    super('google_sheets_not_configured', message, 503);
  }
}

export class GoogleSheetsUnavailableError extends AppError {
  constructor(message = 'Google Sheets is unavailable') {
    super('google_sheets_unavailable', message, 503);
  }
}

export class GoogleSheetsMissingColumnsError extends AppError {
  readonly missingColumns: string[];

  constructor(missingColumns: string[]) {
    super('google_sheets_missing_columns', `Spreadsheet is missing required columns: ${missingColumns.join(', ')}`, 400);
    this.missingColumns = missingColumns;
  }
}
