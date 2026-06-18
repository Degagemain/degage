import { expect, test } from '../../fixtures';
import { E2E_USER_EMAIL } from '../../constants';
import {
  connectPlayConnector,
  disconnectPlayConnector,
  expectPlayConnectorConnectForm,
  openAccountSettings,
  openPlayConnectorTab,
} from './play-connector.helpers';
import { ACCOUNT_SETTINGS_PLAY_CONNECTOR_PATH } from './play-connector.messages';

test.describe('account settings — play connector', () => {
  test('shows connect form on the play connector tab', async ({ page, appServer, asUser }) => {
    void asUser;

    await openAccountSettings(page, appServer.baseURL);
    await openPlayConnectorTab(page);
    await expectPlayConnectorConnectForm(page);
    await expect(page.locator('#play-connector-email')).toHaveValue(E2E_USER_EMAIL);
  });

  test('opens the play connector tab from the query parameter', async ({ page, appServer, asUser }) => {
    void asUser;

    await openAccountSettings(page, appServer.baseURL, ACCOUNT_SETTINGS_PLAY_CONNECTOR_PATH);
    await expectPlayConnectorConnectForm(page);
  });

  test('links and disconnects play connector credentials', async ({ page, appServer, asUser }) => {
    void asUser;

    await openAccountSettings(page, appServer.baseURL, ACCOUNT_SETTINGS_PLAY_CONNECTOR_PATH);
    await connectPlayConnector(page);
    await disconnectPlayConnector(page);
  });
});
