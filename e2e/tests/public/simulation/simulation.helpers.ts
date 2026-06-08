import { type Page, expect } from '../../../fixtures';

import { E2E_SIMULATION } from '../../../simulation-fixtures';

import type { SimulationCopy } from './simulation.copy';

export const SIMULATION_PATH = '/app/simulation';

export type CarFormData = {
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
  purchasePrice?: number;
};

const defaultCarFormData = (copy: SimulationCopy): CarFormData => ({
  townQuery: E2E_SIMULATION.townQuery,
  townOption: E2E_SIMULATION.townOption,
  brandQuery: E2E_SIMULATION.brandName,
  brandOption: E2E_SIMULATION.brandName,
  fuelTypeName: copy.fuelTypeName,
  carTypeQuery: E2E_SIMULATION.carTypeName,
  carTypeOption: E2E_SIMULATION.carTypeName,
  mileage: E2E_SIMULATION.mileage,
  firstRegistrationDate: E2E_SIMULATION.firstRegistrationDate,
  ownerKmPerYear: E2E_SIMULATION.ownerKmPerYear,
});

export async function gotoSimulation(page: Page, baseURL: string, copy: SimulationCopy) {
  await page.goto(`${baseURL}${SIMULATION_PATH}`);
  await expect(page.getByRole('heading', { level: 1, name: copy.situationHeading })).toBeVisible();
}

export async function selectExistingCarSituation(page: Page, copy: SimulationCopy) {
  await page.getByRole('button', { name: copy.existingCarTile }).click();
}

export async function selectNewCarSituation(page: Page, copy: SimulationCopy) {
  await page.getByRole('button', { name: copy.newCarTile }).click();
}

export async function continueFromSituation(page: Page, copy: SimulationCopy) {
  await page.getByRole('button', { name: copy.startSimulationCta }).click();
  await expect(page.getByRole('heading', { level: 1, name: copy.carInfoHeading })).toBeVisible();
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

async function fillSharedCarFields(page: Page, copy: SimulationCopy, data: CarFormData) {
  await selectSearchDropdown(page, copy.townLabel, data.townQuery!, data.townOption!);
  await selectSearchDropdown(page, copy.brandLabel, data.brandQuery!, data.brandOption!);
  await fieldByLabel(page, copy.fuelTypeLabel).locator('select').selectOption({ label: data.fuelTypeName! });
  await selectSearchDropdown(page, copy.carTypeLabel, data.carTypeQuery!, data.carTypeOption!);
  await fieldByLabel(page, copy.ownerKmLabel).locator('input').fill(String(data.ownerKmPerYear));
}

export async function fillExistingCarForm(page: Page, copy: SimulationCopy, overrides: CarFormData = {}) {
  const data = { ...defaultCarFormData(copy), ...overrides };

  await fillSharedCarFields(page, copy, data);
  await fieldByLabel(page, copy.mileageLabel).locator('input').fill(String(data.mileage));
  await page.locator('#sim-first-registration').fill(data.firstRegistrationDate!);
}

export async function fillNewCarForm(page: Page, copy: SimulationCopy, overrides: CarFormData = {}) {
  const data = {
    ...defaultCarFormData(copy),
    mileage: E2E_SIMULATION.newCarMileage,
    purchasePrice: E2E_SIMULATION.newCarPurchasePrice,
    ...overrides,
  };

  await fillSharedCarFields(page, copy, data);
  await fieldByLabel(page, copy.purchaseAmountLabel).locator('input').fill(String(data.purchasePrice));
  await fieldByLabel(page, copy.mileageLabel).locator('input').fill(String(data.mileage));
}

export async function submitCarInfo(page: Page, copy: SimulationCopy) {
  await page.getByRole('button', { name: copy.submitSimulationCta }).click();
}

export async function runExistingCarSimulation(page: Page, copy: SimulationCopy, overrides: CarFormData = {}) {
  await selectExistingCarSituation(page, copy);
  await continueFromSituation(page, copy);
  await fillExistingCarForm(page, copy, overrides);
  await submitCarInfo(page, copy);
}

export async function runNewCarSimulation(page: Page, copy: SimulationCopy, overrides: CarFormData = {}) {
  await selectNewCarSituation(page, copy);
  await continueFromSituation(page, copy);
  await fillNewCarForm(page, copy, overrides);
  await submitCarInfo(page, copy);
}
