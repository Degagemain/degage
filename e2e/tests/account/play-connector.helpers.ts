import { type Page, expect } from '../../fixtures';
import { E2E_PASSWORD, E2E_USER_EMAIL } from '../../constants';
import { ACCOUNT_SETTINGS_PATH, ACCOUNT_SETTINGS_PLAY_CONNECTOR_PATH, playConnectorMessages } from './play-connector.messages';

const playConnectorEmail = (page: Page) => page.locator('#play-connector-email');
const playConnectorPassword = (page: Page) => page.locator('#play-connector-password');

export const openAccountSettings = async (page: Page, baseURL: string, path = ACCOUNT_SETTINGS_PATH) => {
  await page.goto(`${baseURL}${path}`);
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
};

export const openPlayConnectorTab = async (page: Page) => {
  await page.getByRole('tab', { name: playConnectorMessages.tabTitle }).click();
  await expect(playConnectorEmail(page)).toBeVisible();
};

export const expectPlayConnectorConnectForm = async (page: Page) => {
  await expect(page.getByRole('note')).toContainText(playConnectorMessages.credentialsNoticeTitle);
  await expect(playConnectorEmail(page)).toBeVisible();
  await expect(playConnectorPassword(page)).toBeVisible();
  await expect(page.getByRole('button', { name: playConnectorMessages.connect, exact: true })).toBeVisible();
};

export const connectPlayConnector = async (page: Page, email: string = E2E_USER_EMAIL, password: string = E2E_PASSWORD) => {
  await playConnectorEmail(page).fill(email);
  await playConnectorPassword(page).fill(password);
  await page.getByRole('button', { name: playConnectorMessages.connect, exact: true }).click();
  await expect(page.getByText(playConnectorMessages.connectedAs(email))).toBeVisible();
  await expect(page.getByRole('button', { name: playConnectorMessages.disconnect, exact: true })).toBeVisible();
};

export const disconnectPlayConnector = async (page: Page) => {
  await page.getByRole('button', { name: playConnectorMessages.disconnect, exact: true }).click();
  await expectPlayConnectorConnectForm(page);
};
