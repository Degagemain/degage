import { afterEach, describe, expect, it } from 'vitest';

import { getCarOnboardingGsheetSheetName } from '@/actions/car-onboarding/gsheet/config';

describe('getCarOnboardingGsheetSheetName', () => {
  afterEach(() => {
    delete process.env.GOOGLE_SHEETS_CAR_ONBOARDING_SHEET_NAME;
  });

  it('returns undefined when unset or blank', () => {
    delete process.env.GOOGLE_SHEETS_CAR_ONBOARDING_SHEET_NAME;
    expect(getCarOnboardingGsheetSheetName()).toBeUndefined();

    process.env.GOOGLE_SHEETS_CAR_ONBOARDING_SHEET_NAME = '   ';
    expect(getCarOnboardingGsheetSheetName()).toBeUndefined();
  });

  it('returns the trimmed sheet name when set', () => {
    process.env.GOOGLE_SHEETS_CAR_ONBOARDING_SHEET_NAME = '  Cars  ';
    expect(getCarOnboardingGsheetSheetName()).toBe('Cars');
  });
});
