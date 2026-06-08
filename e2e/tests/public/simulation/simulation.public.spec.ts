import { expect, test } from '../../../fixtures';

import { E2E_SIMULATION } from '../../../simulation-fixtures';

import { SIMULATION_LOCALES, simulationCopy } from './simulation.copy';
import {
  continueFromSituation,
  fillExistingCarForm,
  gotoSimulation,
  runExistingCarSimulation,
  runNewCarSimulation,
  selectExistingCarSituation,
} from './simulation.helpers';

for (const locale of SIMULATION_LOCALES) {
  test.describe(`public simulation (${locale})`, () => {
    test.use({ locale });

    const copy = simulationCopy[locale];

    test('requires a situation choice before continuing', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, copy);

      const startButton = page.getByRole('button', { name: copy.startSimulationCta });
      await expect(startButton).toBeDisabled();

      await selectExistingCarSituation(page, copy);
      await expect(startButton).toBeEnabled();

      await continueFromSituation(page, copy);
      await expect(page.getByRole('heading', { level: 1, name: copy.carInfoHeading })).toBeVisible();
    });

    test('keeps simulate disabled until the car form is complete', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, copy);
      await selectExistingCarSituation(page, copy);
      await continueFromSituation(page, copy);

      const submitButton = page.getByRole('button', { name: copy.submitSimulationCta });
      await expect(submitButton).toBeDisabled();

      await fillExistingCarForm(page, copy);
      await expect(submitButton).toBeEnabled();
    });

    test('rejects a car above the mileage limit', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, copy);
      await runExistingCarSimulation(page, copy, { mileage: 250_000 });

      await expect(page.getByRole('heading', { name: copy.notOkResultHeading })).toBeVisible({ timeout: 60_000 });
    });

    test('accepts a seeded existing car without calling the LLM', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, copy);
      await runExistingCarSimulation(page, copy);

      await expect(page.getByRole('heading', { name: copy.successResultHeading })).toBeVisible({ timeout: 60_000 });
      await expect(page.getByText(copy.categoryA)).toBeVisible();
    });

    test('accepts a seeded new car without calling the LLM', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, copy);
      await runNewCarSimulation(page, copy);

      await expect(page.getByRole('heading', { name: copy.successResultHeading })).toBeVisible({ timeout: 60_000 });
      await expect(page.getByText(copy.categoryA)).toBeVisible();
    });

    test('rejects an expensive new car', async ({ page, appServer }) => {
      await gotoSimulation(page, appServer.baseURL, copy);
      await runNewCarSimulation(page, copy, { purchasePrice: E2E_SIMULATION.newCarExpensivePurchasePrice });

      await expect(page.getByRole('heading', { name: copy.notOkResultHeading })).toBeVisible({ timeout: 60_000 });
    });
  });
}
