import { expect, test } from '../../../fixtures';
import type { Page } from '@playwright/test';

import { E2E_CAR_ONBOARDING } from '../../../car-onboarding-fixtures';

const field = (page: Page, label: string) => page.getByText(label, { exact: true }).locator('..');

test.describe('public car onboarding steps', () => {
  test.use({ locale: 'en' });

  test('step 3 (user info) saves and persists', async ({ page, appServer, asUser }) => {
    await asUser;

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/user-info`);

    await field(page, 'Street').getByRole('textbox').fill(E2E_CAR_ONBOARDING.userInfo.street);
    await field(page, 'House number').getByRole('textbox').fill(E2E_CAR_ONBOARDING.userInfo.houseNumber);

    const townField = field(page, 'Town');
    await townField.getByRole('combobox').click();
    await page.getByPlaceholder('Search…').fill(E2E_CAR_ONBOARDING.userInfo.townQuery);
    await page.getByRole('option', { name: E2E_CAR_ONBOARDING.userInfo.townOption, exact: true }).click();

    await field(page, 'Phone').getByRole('textbox').fill(E2E_CAR_ONBOARDING.userInfo.phone);

    await page.getByRole('button', { name: /Save & Next/i }).click();
    await expect(page).toHaveURL(/\/car-info$/);

    // revisit and verify persisted
    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/user-info`);
    await expect(field(page, 'Street').getByRole('textbox')).toHaveValue(E2E_CAR_ONBOARDING.userInfo.street);
    await expect(field(page, 'House number').getByRole('textbox')).toHaveValue(E2E_CAR_ONBOARDING.userInfo.houseNumber);
    await expect(field(page, 'Phone').getByRole('textbox')).toHaveValue(E2E_CAR_ONBOARDING.userInfo.phone);
    await expect(field(page, 'Town').getByRole('combobox')).toContainText(E2E_CAR_ONBOARDING.userInfo.townOption);
  });

  test('step 5 (insurer) saves and persists', async ({ page, appServer, asUser }) => {
    await asUser;

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/insurer`);

    const checkboxLabel = 'I currently have an active insurance contract for this car';
    await page.getByText(checkboxLabel, { exact: true }).locator('..').locator('input[type="checkbox"]').check();

    const insurerField = field(page, 'Insurer');
    await insurerField.getByRole('combobox').click();
    await page.getByPlaceholder('Search…').fill(E2E_CAR_ONBOARDING.insurer.name);
    await page.getByRole('option', { name: E2E_CAR_ONBOARDING.insurer.name, exact: true }).click();

    await field(page, 'Insurer contract started').locator('input[type="date"]').fill(E2E_CAR_ONBOARDING.insurer.contractStartedAt);

    await page.getByRole('button', { name: /Save & Next/i }).click();
    await expect(page).toHaveURL(/\/road-assistance-plan$/);

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/insurer`);
    await expect(page.getByText(checkboxLabel, { exact: true }).locator('..').locator('input[type="checkbox"]')).toBeChecked();
    await expect(field(page, 'Insurer').getByRole('combobox')).toContainText(E2E_CAR_ONBOARDING.insurer.name);
    await expect(field(page, 'Insurer contract started').locator('input[type="date"]')).toHaveValue(
      E2E_CAR_ONBOARDING.insurer.contractStartedAt,
    );
  });

  test('step 6 (road assistance) saves and persists', async ({ page, appServer, asUser }) => {
    await asUser;

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/road-assistance-plan`);

    await page.getByRole('button', { name: /Save & Next/i }).click();
    await expect(page).toHaveURL(/\/car-value$/);

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/road-assistance-plan`);
    await expect(page.getByRole('checkbox')).not.toBeChecked();
  });

  test('step 7 (car value) can be accepted', async ({ page, appServer, asUser }) => {
    await asUser;

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/car-value`);

    await page.getByRole('button', { name: 'Yes, I agree' }).click();
    await page.getByRole('button', { name: /Save & Next/i }).click();
    await expect(page).toHaveURL(/\/car-stickers$/);

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/car-value`);
    await expect(page.getByLabel('Complete')).toBeVisible();
  });
});
