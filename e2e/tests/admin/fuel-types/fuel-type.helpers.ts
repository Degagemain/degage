import { type Page, expect } from '../../../fixtures';

export const FUEL_TYPES_LIST_PATH = '/app/admin/fuel-types';
export const FUEL_TYPES_NEW_PATH = '/app/admin/fuel-types/new';

export type FuelTypeFormData = {
  code: string;
  nameNl: string;
  nameEn: string;
  nameFr: string;
  pricePer?: string;
  co2Contribution?: string;
};

export const uniqueFuelTypeCode = (): string => `e2e-ft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const defaultFuelTypeFormData = (code: string): FuelTypeFormData => ({
  code,
  nameNl: `E2E brandstof ${code}`,
  nameEn: `E2E fuel ${code}`,
  nameFr: `E2E carburant ${code}`,
  pricePer: '1.25',
  co2Contribution: '12',
});

const fillTranslation = async (page: Page, locale: 'en' | 'nl' | 'fr', name: string) => {
  await page.getByRole('button', { name: locale, exact: true }).click();
  await page.getByPlaceholder(`Name (${locale.toUpperCase()})`).fill(name);
};

export const fillFuelTypeForm = async (page: Page, data: FuelTypeFormData) => {
  const form = page.locator('#fuel-type-editor-form');
  await form.getByPlaceholder('e.g. petrol').fill(data.code);

  const spinbuttons = form.getByRole('spinbutton');
  await spinbuttons.nth(0).fill(data.pricePer ?? '0');
  await spinbuttons.nth(1).fill(data.co2Contribution ?? '0');

  await fillTranslation(page, 'nl', data.nameNl);
  await fillTranslation(page, 'en', data.nameEn);
  await fillTranslation(page, 'fr', data.nameFr);
};

export const createFuelTypeViaUi = async (page: Page, baseURL: string, data: FuelTypeFormData) => {
  await page.goto(`${baseURL}${FUEL_TYPES_NEW_PATH}`);
  await fillFuelTypeForm(page, data);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(new RegExp(`${FUEL_TYPES_LIST_PATH.replace(/\//g, '\\/')}$`));
  await expect(page.getByText('Saved successfully.').first()).toBeVisible();
};

export const openFuelTypeEditFromList = async (page: Page, displayName: string) => {
  await page.getByRole('link', { name: displayName }).click();
  await expect(page).toHaveURL(/\/app\/admin\/fuel-types\/[0-9a-f-]{36}/);
};

export const deleteFuelTypeFromList = async (page: Page, displayName: string) => {
  const row = page.getByRole('row').filter({ hasText: displayName });
  await row.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Fuel type deleted successfully.')).toBeVisible();
};
