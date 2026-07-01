import { type Page, expect } from '../../../fixtures';

import { E2E_SIMULATION } from '../../../simulation-fixtures';

import type { SimulationMessages } from './simulation.messages';

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

const defaultCarFormData = (messages: SimulationMessages): CarFormData => ({
  townQuery: E2E_SIMULATION.townQuery,
  townOption: E2E_SIMULATION.townOption,
  brandQuery: E2E_SIMULATION.brandName,
  brandOption: E2E_SIMULATION.brandName,
  fuelTypeName: messages.fuelTypeName,
  carTypeQuery: E2E_SIMULATION.carTypeName,
  carTypeOption: E2E_SIMULATION.carTypeName,
  mileage: E2E_SIMULATION.mileage,
  firstRegistrationDate: E2E_SIMULATION.firstRegistrationDate,
  ownerKmPerYear: E2E_SIMULATION.ownerKmPerYear,
});

export async function gotoSimulation(page: Page, baseURL: string, messages: SimulationMessages) {
  await page.goto(`${baseURL}${SIMULATION_PATH}`);
  await expect(page.getByRole('heading', { level: 1, name: messages.situationHeading })).toBeVisible();
}

export async function selectExistingCarSituation(page: Page, messages: SimulationMessages) {
  await page.getByRole('button', { name: messages.existingCarTile }).click();
}

export async function selectNewCarSituation(page: Page, messages: SimulationMessages) {
  await page.getByRole('button', { name: messages.newCarTile }).click();
}

export async function continueFromSituation(page: Page, messages: SimulationMessages) {
  await page.getByRole('button', { name: messages.startSimulationCta }).click();
  await expect(page.getByRole('heading', { level: 1, name: messages.carInfoHeading })).toBeVisible();
}

function fieldByLabel(page: Page, labelText: string) {
  return page.getByText(labelText, { exact: true }).locator('xpath=ancestor::div[.//button or .//input or .//select][1]');
}

async function selectSearchDropdown(page: Page, fieldLabel: string, query: string, optionName: string) {
  const field = fieldByLabel(page, fieldLabel);
  await field.getByRole('button').first().click();
  await page.getByPlaceholder('Zoeken…').fill(query);
  await page.getByRole('option', { name: optionName, exact: true }).click();
}

async function fillSharedCarFields(page: Page, messages: SimulationMessages, data: CarFormData) {
  await selectSearchDropdown(page, messages.townLabel, data.townQuery!, data.townOption!);
  await selectSearchDropdown(page, messages.brandLabel, data.brandQuery!, data.brandOption!);
  await fieldByLabel(page, messages.fuelTypeLabel).locator('select').selectOption({ label: data.fuelTypeName! });
  await selectSearchDropdown(page, messages.carTypeLabel, data.carTypeQuery!, data.carTypeOption!);
  await fieldByLabel(page, messages.ownerKmLabel).locator('input').fill(String(data.ownerKmPerYear));
}

export async function fillExistingCarForm(page: Page, messages: SimulationMessages, overrides: CarFormData = {}) {
  const data = { ...defaultCarFormData(messages), ...overrides };

  await fillSharedCarFields(page, messages, data);
  await fieldByLabel(page, messages.mileageLabel).locator('input').fill(String(data.mileage));
  await page.locator('#sim-first-registration').fill(data.firstRegistrationDate!);
}

export async function fillNewCarForm(page: Page, messages: SimulationMessages, overrides: CarFormData = {}) {
  const data = {
    ...defaultCarFormData(messages),
    mileage: E2E_SIMULATION.newCarMileage,
    purchasePrice: E2E_SIMULATION.newCarPurchasePrice,
    ...overrides,
  };

  await fillSharedCarFields(page, messages, data);
  await fieldByLabel(page, messages.purchaseAmountLabel).locator('input').fill(String(data.purchasePrice));
  const isNewCarField = fieldByLabel(page, messages.isNewCarLabel);
  const isNewCarToggle = isNewCarField.getByRole('button').first();
  const isNewCarOn = (await isNewCarToggle.getAttribute('aria-pressed')) === 'true';
  if (!isNewCarOn) {
    await isNewCarToggle.click();
  }
  if (data.mileage != null && data.mileage > 0) {
    await fieldByLabel(page, messages.mileageLabel).locator('input').fill(String(data.mileage));
  }
}

export async function submitCarInfo(page: Page, messages: SimulationMessages) {
  await page.getByRole('button', { name: messages.submitSimulationCta }).click();
}

export async function runExistingCarSimulation(page: Page, messages: SimulationMessages, overrides: CarFormData = {}) {
  await selectExistingCarSituation(page, messages);
  await continueFromSituation(page, messages);
  await fillExistingCarForm(page, messages, overrides);
  await submitCarInfo(page, messages);
}

export async function runNewCarSimulation(page: Page, messages: SimulationMessages, overrides: CarFormData = {}) {
  await selectNewCarSituation(page, messages);
  await continueFromSituation(page, messages);
  await fillNewCarForm(page, messages, overrides);
  await submitCarInfo(page, messages);
}
