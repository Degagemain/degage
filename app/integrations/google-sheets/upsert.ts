import { getGoogleSheetsClient } from '@/integrations/google-sheets/client';
import { GoogleSheetsMissingColumnsError, GoogleSheetsUnavailableError } from '@/integrations/google-sheets/errors';

export type SheetCellValue = string | number | boolean | null | undefined;

export type UpsertRowByHeadersInput = {
  spreadsheetId: string;
  sheetName?: string;
  rowNumber: number | null;
  valuesByHeader: Record<string, SheetCellValue>;
};

const quoteSheetName = (sheetName: string): string => {
  if (/^[A-Za-z0-9_]+$/.test(sheetName)) {
    return sheetName;
  }
  return `'${sheetName.replaceAll("'", "''")}'`;
};

const columnLetter = (index: number): string => {
  let n = index + 1;
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
};

const parseRowNumberFromRange = (updatedRange: string | null | undefined): number | null => {
  if (!updatedRange) {
    return null;
  }
  const match = updatedRange.match(/![A-Z]+(\d+)(?::[A-Z]+(\d+))?$/i);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
};

const resolveSheetName = async (spreadsheetId: string, sheetName?: string): Promise<string> => {
  if (sheetName?.trim()) {
    return sheetName.trim();
  }

  const client = getGoogleSheetsClient();
  const meta = await client.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });
  const title = meta.data.sheets?.[0]?.properties?.title;
  if (!title?.trim()) {
    throw new GoogleSheetsUnavailableError('Spreadsheet has no sheets');
  }
  return title;
};

const readHeaderRow = async (spreadsheetId: string, sheetName: string): Promise<string[]> => {
  const client = getGoogleSheetsClient();
  const response = await client.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetName(sheetName)}!1:1`,
  });
  return (response.data.values?.[0] ?? []).map((cell) => String(cell ?? '').trim());
};

const buildRowValues = (headers: string[], valuesByHeader: Record<string, SheetCellValue>): SheetCellValue[] => {
  const headerIndex = new Map(headers.map((header, index) => [header, index] as const));
  const missing = Object.keys(valuesByHeader).filter((header) => !headerIndex.has(header));
  if (missing.length > 0) {
    throw new GoogleSheetsMissingColumnsError(missing);
  }

  const maxIndex = Math.max(...Object.keys(valuesByHeader).map((header) => headerIndex.get(header)!));
  const row: SheetCellValue[] = Array.from({ length: maxIndex + 1 }, () => '');
  for (const [header, value] of Object.entries(valuesByHeader)) {
    row[headerIndex.get(header)!] = value ?? '';
  }
  return row;
};

export const upsertRowByHeaders = async ({
  spreadsheetId,
  sheetName: sheetNameInput,
  rowNumber,
  valuesByHeader,
}: UpsertRowByHeadersInput): Promise<number> => {
  try {
    const client = getGoogleSheetsClient();
    const sheetName = await resolveSheetName(spreadsheetId, sheetNameInput);
    const headers = await readHeaderRow(spreadsheetId, sheetName);
    const row = buildRowValues(headers, valuesByHeader);
    const quoted = quoteSheetName(sheetName);
    const endColumn = columnLetter(row.length - 1);

    if (rowNumber != null) {
      await client.spreadsheets.values.update({
        spreadsheetId,
        range: `${quoted}!A${rowNumber}:${endColumn}${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
      });
      return rowNumber;
    }

    const appendResponse = await client.spreadsheets.values.append({
      spreadsheetId,
      range: `${quoted}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    const newRowNumber = parseRowNumberFromRange(appendResponse.data.updates?.updatedRange);
    if (newRowNumber == null) {
      throw new GoogleSheetsUnavailableError('Could not determine appended spreadsheet row number');
    }
    return newRowNumber;
  } catch (error) {
    if (error instanceof GoogleSheetsMissingColumnsError || error instanceof GoogleSheetsUnavailableError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unknown Google Sheets error';
    throw new GoogleSheetsUnavailableError(`Google Sheets upsert failed: ${message}`);
  }
};
