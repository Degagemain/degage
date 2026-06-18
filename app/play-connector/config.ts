const DEFAULT_PLAY_CONNECTOR_BASE_URL = 'https://degapp.be';

export const getPlayConnectorBaseUrl = (): string => {
  const configured = process.env.PLAY_CONNECTOR_BASE_URL?.trim();
  return configured || DEFAULT_PLAY_CONNECTOR_BASE_URL;
};
