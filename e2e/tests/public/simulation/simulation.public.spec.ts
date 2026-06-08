import { expect, test } from '../../../fixtures';

import {
  CAR_INFO_HEADING,
  NOT_OK_RESULT_HEADING,
  START_SIMULATION_CTA,
  SUBMIT_SIMULATION_CTA,
  SUCCESS_RESULT_HEADING,
  continueFromSituation,
  fillExistingCarForm,
  gotoSimulation,
  runExistingCarSimulation,
  selectExistingCarSituation,
} from './simulation.helpers';

test.describe('public simulation', () => {
  test('requires a situation choice before continuing', async ({ page, appServer }) => {
    await gotoSimulation(page, appServer.baseURL);

    const startButton = page.getByRole('button', { name: START_SIMULATION_CTA });
    await expect(startButton).toBeDisabled();

    await selectExistingCarSituation(page);
    await expect(startButton).toBeEnabled();

    await continueFromSituation(page);
    await expect(page.getByRole('heading', { level: 1, name: CAR_INFO_HEADING })).toBeVisible();
  });

  test('keeps simulate disabled until the car form is complete', async ({ page, appServer }) => {
    await gotoSimulation(page, appServer.baseURL);
    await selectExistingCarSituation(page);
    await continueFromSituation(page);

    const submitButton = page.getByRole('button', { name: SUBMIT_SIMULATION_CTA });
    await expect(submitButton).toBeDisabled();

    await fillExistingCarForm(page);
    await expect(submitButton).toBeEnabled();
  });

  test('rejects a car above the mileage limit', async ({ page, appServer }) => {
    await gotoSimulation(page, appServer.baseURL);
    await runExistingCarSimulation(page, { mileage: 250_000 });

    await expect(page.getByRole('heading', { name: NOT_OK_RESULT_HEADING })).toBeVisible({ timeout: 60_000 });
  });

  test('accepts a seeded existing car without calling the LLM', async ({ page, appServer }) => {
    await gotoSimulation(page, appServer.baseURL);
    await runExistingCarSimulation(page);

    await expect(page.getByRole('heading', { name: SUCCESS_RESULT_HEADING })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText('Category A')).toBeVisible();
  });
});
