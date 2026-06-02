import { type Page, expect } from '@playwright/test';

/** English copy (e2e fixtures set locale cookie to `en`). */
export const LANDING_PATH = '/app';
export const LANDING_HERO_HEADING = 'Share your car, share the costs';
export const SIMULATION_SITUATION_HEADING = 'Does your car fit Dégage?';
export const FAQ_PAGE_HEADING = 'Help & FAQ';

export const LANDING_SIMULATION_LINK_COUNT = 3;
export const LANDING_FAQ_LINK_COUNT = 2;

export async function gotoLandingAsGuest(page: Page, baseURL: string) {
  await page.goto(`${baseURL}${LANDING_PATH}`);
  await expect(page.getByRole('heading', { level: 1, name: LANDING_HERO_HEADING })).toBeVisible();
}
