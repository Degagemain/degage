const FUEL_CODE_TO_SHEET_LABEL: Record<string, string> = {
  diesel: 'DIESEL',
  electric: 'ELEKTRISCH',
  'plugin-hybrid': 'Plugin Hybride',
  gasoline: 'Benzine',
  hybrid: 'Hybride',
  lpg: 'LPG',
  cng: 'CNG',
  hydrogen: 'Waterstof',
};

export const mapFuelCodeToSheetLabel = (code: string): string | null => {
  return FUEL_CODE_TO_SHEET_LABEL[code] ?? null;
};
