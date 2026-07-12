import { expect, test } from '../../../fixtures';

import { E2E_SIMULATION } from '../../../simulation-fixtures';

import { SIMULATION_LOCALES, simulationMessages } from './simulation.messages';
import {
  continueFromSituation,
  fillExistingCarForm,
  getSimulationIdFromUrl,
  gotoSimulation,
  runExistingCarSimulation,
  runNewCarSimulation,
  selectExistingCarSituation,
  waitForSimulationResultPage,
} from './simulation.helpers';

for (const locale of SIMULATION_LOCALES) {
  test.describe(`public simulation (${locale})`, () => {
    test.use({ locale });

    const messages = simulationMessages[locale];

    test('requires a situation choice before continuing', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);

      const startButton = page.getByRole('button', { name: messages.startSimulationCta });
      await expect(startButton).toBeDisabled();

      await selectExistingCarSituation(page, messages);
      await expect(startButton).toBeEnabled();

      await continueFromSituation(page, messages);
      await expect(page.getByRole('heading', { level: 1, name: messages.carInfoHeading })).toBeVisible();
    });

    test('keeps simulate disabled until the car form is complete', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);
      await selectExistingCarSituation(page, messages);
      await continueFromSituation(page, messages);

      const submitButton = page.getByRole('button', { name: messages.submitSimulationCta });
      await expect(submitButton).toBeDisabled();

      await fillExistingCarForm(page, messages);
      await expect(submitButton).toBeEnabled();
    });

    test('blocks commercial vehicles with a warning', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);
      await selectExistingCarSituation(page, messages);
      await continueFromSituation(page, messages);

      const submitButton = page.getByRole('button', { name: messages.submitSimulationCta });
      const commercialField = page.getByText(messages.commercialVehicleLabel, { exact: true }).locator('..');
      await commercialField.getByRole('button').click();

      await expect(page.getByRole('alert').filter({ hasText: messages.commercialVehicleWarning })).toBeVisible();
      await expect(submitButton).toBeDisabled();

      await fillExistingCarForm(page, messages);
      await expect(submitButton).toBeDisabled();
    });

    test('rejects a car above the mileage limit', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);
      await runExistingCarSimulation(page, messages, { mileage: 250_000 });

      await expect(page.getByRole('heading', { name: messages.notOkResultHeading })).toBeVisible({ timeout: 60_000 });
    });

    test('accepts a seeded existing car without calling the LLM', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);
      await runExistingCarSimulation(page, messages);

      await expect(page.getByRole('heading', { name: messages.successResultHeading })).toBeVisible({ timeout: 60_000 });
      await expect(page.getByText(messages.categoryA)).toBeVisible();
    });

    test('accepts a seeded new car without calling the LLM', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);
      await runNewCarSimulation(page, messages);

      await expect(page.getByRole('heading', { name: messages.successResultHeading })).toBeVisible({ timeout: 60_000 });
      await expect(page.getByText(messages.categoryA)).toBeVisible();
    });

    test('rejects an expensive new car', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);
      await runNewCarSimulation(page, messages, { purchasePrice: E2E_SIMULATION.newCarExpensivePurchasePrice });

      await expect(page.getByRole('heading', { name: messages.notOkResultHeading })).toBeVisible({ timeout: 60_000 });
    });

    test('opens a saved simulation directly by id', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, messages);
      await runExistingCarSimulation(page, messages);

      await expect(page.getByRole('heading', { name: messages.successResultHeading })).toBeVisible({ timeout: 60_000 });
      const simulationId = await getSimulationIdFromUrl(page);

      await page.goto(`${appServer.baseURL}/app/simulation/${simulationId}`);
      await waitForSimulationResultPage(page);
      await expect(page.getByRole('heading', { name: messages.successResultHeading })).toBeVisible({ timeout: 60_000 });
    });
  });
}
