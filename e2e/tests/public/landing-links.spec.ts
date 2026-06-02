import { expect, test } from '../../fixtures';

import {
  FAQ_PAGE_HEADING,
  LANDING_FAQ_LINK_COUNT,
  LANDING_HERO_HEADING,
  LANDING_SIMULATION_LINK_COUNT,
  SIMULATION_SITUATION_HEADING,
  gotoLandingAsGuest,
} from './landing.helpers';

test.describe('landing page links', () => {
  test('exposes expected internal navigation links', async ({ page, appServer }) => {
    await gotoLandingAsGuest(page, appServer.baseURL);

    await expect(page.locator('header a[href="/app"]')).toHaveCount(1);
    await expect(page.locator('a[href="/app/simulation"]')).toHaveCount(LANDING_SIMULATION_LINK_COUNT);
    await expect(page.locator('a[href="/app/faq"]')).toHaveCount(LANDING_FAQ_LINK_COUNT);
  });

  test('logo link keeps the guest on the landing page', async ({ page, appServer }) => {
    await gotoLandingAsGuest(page, appServer.baseURL);

    await page.locator('header a[href="/app"]').click();

    await expect(page).toHaveURL(/\/app\/?$/);
    await expect(page.getByRole('heading', { level: 1, name: LANDING_HERO_HEADING })).toBeVisible();
  });

  test('simulation CTAs navigate to the public simulation', async ({ page, appServer }) => {
    const links = page.locator('a[href="/app/simulation"]');

    for (let i = 0; i < LANDING_SIMULATION_LINK_COUNT; i++) {
      await gotoLandingAsGuest(page, appServer.baseURL);
      await links.nth(i).click();
      await expect(page).toHaveURL(/\/app\/simulation/);
      await expect(page.getByRole('heading', { level: 1, name: SIMULATION_SITUATION_HEADING })).toBeVisible();
    }
  });

  test('FAQ links navigate to the help center', async ({ page, appServer }) => {
    const links = page.locator('a[href="/app/faq"]');

    for (let i = 0; i < LANDING_FAQ_LINK_COUNT; i++) {
      await gotoLandingAsGuest(page, appServer.baseURL);
      await links.nth(i).click();
      await expect(page).toHaveURL(/\/app\/faq\/?$/);
      await expect(page.getByRole('heading', { level: 1, name: FAQ_PAGE_HEADING })).toBeVisible();
    }
  });

  test('sign-in dialog links target Degapp and onboarding sign-in', async ({ page, appServer }) => {
    await gotoLandingAsGuest(page, appServer.baseURL);

    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();

    const degapp = page.getByRole('link', { name: /Degapp/i });
    await expect(degapp).toHaveAttribute('href', 'https://degapp.be/');
    await expect(degapp).toHaveAttribute('target', '_blank');

    const onboarding = page.getByRole('link', { name: 'New owner onboarding' });
    await expect(onboarding).toHaveAttribute('href', /\/app\/auth\/sign-in/);
  });
});
