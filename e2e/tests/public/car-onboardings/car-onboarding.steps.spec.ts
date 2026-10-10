import { expect, test } from '../../../fixtures';
import type { Page } from '@playwright/test';

import { E2E_CAR_ONBOARDING } from '../../../car-onboarding-fixtures';
import { E2E_USER_EMAIL } from '../../../constants';
import { playConnectorMessages } from '../../account/play-connector.messages';

const field = (page: Page, label: string) => page.getByText(label, { exact: true }).locator('..');

test.describe('public car onboarding steps', () => {
  test.use({ locale: 'en' });

  test('step 1 (play connector) hides disconnect after connecting', async ({ page, appServer, asUser }) => {
    await asUser;

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/play-connector`);

    await expect(page.getByText(playConnectorMessages.connectedAs(E2E_USER_EMAIL))).toBeVisible();
    await expect(page.getByRole('button', { name: playConnectorMessages.disconnect, exact: true })).toHaveCount(0);
  });

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

  test('step 6 (road assistance) requires a choice and persists', async ({ page, appServer, asUser }) => {
    await asUser;

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/road-assistance-plan`);

    const choice = page.getByLabel('Existing road assistance?');
    const saveAndNext = page.getByRole('button', { name: /Save & Next/i });
    await expect(choice).toHaveValue('');
    await expect(saveAndNext).toBeDisabled();

    await choice.selectOption({ label: 'I have road assistance for this car.' });
    const planName = field(page, 'Existing road assistance plan name').getByRole('textbox');
    const endDate = field(page, 'Existing road assistance plan end date').locator('input[type="date"]');
    await expect(planName).toBeVisible();
    await expect(saveAndNext).toBeDisabled();

    await planName.fill('VAB Europa');
    await endDate.fill('2027-06-01');
    await saveAndNext.click();
    await expect(page).toHaveURL(/\/car-value$/);

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/road-assistance-plan`);
    await expect(choice).toHaveValue('yes');
    await expect(planName).toHaveValue('VAB Europa');
    await expect(endDate).toHaveValue('2027-06-01');

    await choice.selectOption({ label: 'I do not have road assistance for this car yet.' });
    await expect(planName).toHaveCount(0);
    await saveAndNext.click();
    await expect(page).toHaveURL(/\/car-value$/);

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/road-assistance-plan`);
    await expect(choice).toHaveValue('no');
    await expect(page.getByText('Existing road assistance plan name', { exact: true })).toHaveCount(0);
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

  test('step 8 (car stickers) saves and continues to the next step or overview', async ({ page, appServer, asUser }) => {
    await asUser;

    await page.goto(`${appServer.baseURL}/app/car-onboardings/${E2E_CAR_ONBOARDING.id}/car-stickers`);

    await page.getByRole('button', { name: /Save & Next/i }).click();
    await expect(page).toHaveURL(new RegExp(`/app/car-onboardings/${E2E_CAR_ONBOARDING.id}(/share-start)?$`));
  });
});
