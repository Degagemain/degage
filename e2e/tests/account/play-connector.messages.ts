export const playConnectorMessages = {
  tabTitle: 'Degapp connection',
  title: 'Degapp connection',
  credentialsNoticeTitle: 'These are your Degapp login credentials',
  connect: 'Connect',
  disconnect: 'Disconnect',
  connectedAs: (email: string) => `Connected as ${email}`,
} as const;

export const ACCOUNT_SETTINGS_PATH = '/app/account/settings';
export const ACCOUNT_SETTINGS_PLAY_CONNECTOR_PATH = '/app/account/settings?tab=play-connector';
