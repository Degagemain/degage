import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/google-sheets/client', () => ({
  getGoogleSheetsClient: vi.fn(),
}));

import { getGoogleSheetsClient } from '@/integrations/google-sheets/client';
import { GoogleSheetsMissingColumnsError } from '@/integrations/google-sheets/errors';
import { upsertRowByHeaders } from '@/integrations/google-sheets/upsert';

describe('upsertRowByHeaders', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const spreadsheetId = 'sheet-123';

  it('aborts when required headers are missing', async () => {
    vi.mocked(getGoogleSheetsClient).mockReturnValue({
      spreadsheets: {
        get: vi.fn().mockResolvedValue({ data: { sheets: [{ properties: { title: 'Sheet1' } }] } }),
        values: {
          get: vi.fn().mockResolvedValue({ data: { values: [['Rijnr', 'Adres']] } }),
          update: vi.fn(),
          append: vi.fn(),
        },
      },
    } as never);

    await expect(
      upsertRowByHeaders({
        spreadsheetId,
        rowNumber: null,
        valuesByHeader: { Rijnr: 1, Adres: 'Street 1', Brandstof: 'DIESEL' },
      }),
    ).rejects.toThrow(GoogleSheetsMissingColumnsError);
  });

  it('updates an existing row when rowNumber is set', async () => {
    const update = vi.fn().mockResolvedValue({});
    vi.mocked(getGoogleSheetsClient).mockReturnValue({
      spreadsheets: {
        get: vi.fn().mockResolvedValue({ data: { sheets: [{ properties: { title: 'Cars' } }] } }),
        values: {
          get: vi.fn().mockResolvedValue({ data: { values: [['Rijnr', 'Adres', 'Brandstof']] } }),
          update,
          append: vi.fn(),
        },
      },
    } as never);

    await expect(
      upsertRowByHeaders({
        spreadsheetId,
        rowNumber: 12,
        valuesByHeader: { Rijnr: 12, Adres: 'Street 1', Brandstof: 'DIESEL' },
      }),
    ).resolves.toBe(12);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId,
        range: 'Cars!A12:C12',
        requestBody: { values: [[12, 'Street 1', 'DIESEL']] },
      }),
    );
  });

  it('appends a row and returns the new row number', async () => {
    const append = vi.fn().mockResolvedValue({
      data: { updates: { updatedRange: 'Sheet1!A15:C15' } },
    });
    vi.mocked(getGoogleSheetsClient).mockReturnValue({
      spreadsheets: {
        get: vi.fn().mockResolvedValue({ data: { sheets: [{ properties: { title: 'Sheet1' } }] } }),
        values: {
          get: vi.fn().mockResolvedValue({ data: { values: [['Rijnr', 'Adres', 'Brandstof']] } }),
          update: vi.fn(),
          append,
        },
      },
    } as never);

    await expect(
      upsertRowByHeaders({
        spreadsheetId,
        rowNumber: null,
        valuesByHeader: { Rijnr: '', Adres: 'Street 1', Brandstof: 'DIESEL' },
      }),
    ).resolves.toBe(15);

    expect(append).toHaveBeenCalled();
  });
});
