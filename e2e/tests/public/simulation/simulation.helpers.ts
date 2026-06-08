import { type Page, expect } from '../../../fixtures';

import { E2E_SIMULATION } from '../../../simulation-fixtures';

export const SIMULATION_PATH = '/app/simulation';
export const SITUATION_HEADING = 'Does your car fit Dégage?';
export const CAR_INFO_HEADING = 'Tell us about your car';
export const SUCCESS_RESULT_HEADING = 'Good news — your car is eligible';
export const NOT_OK_RESULT_HEADING = 'This car is not eligible';

export const EXISTING_CAR_TILE = 'Check my current car';
export const START_SIMULATION_CTA = 'Start the simulation →';
export const SUBMIT_SIMULATION_CTA = 'Simulate my car →';

export type ExistingCarFormData = {
  townQuery?: string;
  townOption?: string;
  brandQuery?: string;
  brandOption?: string;
  fuelTypeName?: string;
  carTypeQuery?: string;
  carTypeOption?: string;
  mileage?: number;
  firstRegistrationDate?: string;
  ownerKmPerYear?: number;
};

const defaultExistingCarFormData = (): ExistingCarFormData => ({
  townQuery: E2E_SIMULATION.townQuery,
  townOption: E2E_SIMULATION.townOption,
  brandQuery: E2E_SIMULATION.brandName,
  brandOption: E2E_SIMULATION.brandName,
  fuelTypeName: E2E_SIMULATION.fuelTypeName,
  carTypeQuery: E2E_SIMULATION.carTypeName,
  carTypeOption: E2E_SIMULATION.carTypeName,
  mileage: E2E_SIMULATION.mileage,
  firstRegistrationDate: E2E_SIMULATION.firstRegistrationDate,
  ownerKmPerYear: E2E_SIMULATION.ownerKmPerYear,
});

export async function gotoSimulation(page: Page, baseURL: string) {
  await page.goto(`${baseURL}${SIMULATION_PATH}`);
  await expect(page.getByRole('heading', { level: 1, name: SITUATION_HEADING })).toBeVisible();
}

export async function selectExistingCarSituation(page: Page) {
  await page.getByRole('button', { name: EXISTING_CAR_TILE }).click();
}

export async function continueFromSituation(page: Page) {
  await page.getByRole('button', { name: START_SIMULATION_CTA }).click();
  await expect(page.getByRole('heading', { level: 1, name: CAR_INFO_HEADING })).toBeVisible();
}

function fieldByLabel(page: Page, labelText: string) {
  return page.getByText(labelText, { exact: true }).locator('..');
}

async function selectSearchDropdown(page: Page, fieldLabel: string, query: string, optionName: string) {
  const field = fieldByLabel(page, fieldLabel);
  await field.getByRole('button').first().click();
  await page.getByPlaceholder('Zoeken…').fill(query);
  await page.getByRole('option', { name: optionName, exact: true }).click();
}

export async function fillExistingCarForm(page: Page, overrides: ExistingCarFormData = {}) {
  const data = { ...defaultExistingCarFormData(), ...overrides };

  await selectSearchDropdown(page, 'Town', data.townQuery!, data.townOption!);
  await selectSearchDropdown(page, 'Brand', data.brandQuery!, data.brandOption!);
  await fieldByLabel(page, 'Fuel type').locator('select').selectOption({ label: data.fuelTypeName! });
  await selectSearchDropdown(page, 'Car type / model', data.carTypeQuery!, data.carTypeOption!);
  await fieldByLabel(page, 'Mileage').locator('input').fill(String(data.mileage));
  await page.locator('#sim-first-registration').fill(data.firstRegistrationDate!);
  await fieldByLabel(page, 'Km per year').locator('input').fill(String(data.ownerKmPerYear));
}

export async function submitCarInfo(page: Page) {
  await page.getByRole('button', { name: SUBMIT_SIMULATION_CTA }).click();
}

export async function runExistingCarSimulation(page: Page, overrides: ExistingCarFormData = {}) {
  await selectExistingCarSituation(page);
  await continueFromSituation(page);
  await fillExistingCarForm(page, overrides);
  await submitCarInfo(page);
}
