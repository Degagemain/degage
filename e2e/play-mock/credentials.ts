export const PLAY_MOCK_SESSION_COOKIE_NAME = 'PLAY_SESSION';
export const PLAY_MOCK_SESSION_COOKIE_VALUE = 'mock-session';

export const getPlayMockPort = (): number => {
  const raw = process.env.PLAY_MOCK_PORT?.trim();
  const port = raw ? Number(raw) : 3199;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PLAY_MOCK_PORT: ${raw}`);
  }
  return port;
};

export const getPlayMockBaseUrl = (): string => `http://127.0.0.1:${getPlayMockPort()}`;

export const getPlayMockCredentials = (): { email: string; password: string } => ({
  email: process.env.PLAY_MOCK_EMAIL?.trim() || process.env.E2E_USER_EMAIL?.trim() || 'user@e2e.test',
  password: process.env.PLAY_MOCK_PASSWORD?.trim() || process.env.E2E_PASSWORD?.trim() || 'password',
});

export const isValidPlayMockSessionCookie = (cookieHeader: string | undefined): boolean => {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${PLAY_MOCK_SESSION_COOKIE_NAME}=${PLAY_MOCK_SESSION_COOKIE_VALUE}`);
};

export const credentialsMatchPlayMock = (email: string, password: string): boolean => {
  const expected = getPlayMockCredentials();
  return email === expected.email && password === expected.password;
};
