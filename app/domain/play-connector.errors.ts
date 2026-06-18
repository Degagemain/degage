export const playConnectorActionErrorCodes = {
  notConfigured: 'not_configured',
  credentialsInvalid: 'credentials_invalid',
  loginFailed: 'login_failed',
  linkFailed: 'link_failed',
} as const;

export type PlayConnectorActionErrorCode = (typeof playConnectorActionErrorCodes)[keyof typeof playConnectorActionErrorCodes];

export class PlayConnectorActionError extends Error {
  readonly code: PlayConnectorActionErrorCode;

  constructor(code: PlayConnectorActionErrorCode, message: string) {
    super(message);
    this.name = 'PlayConnectorActionError';
    this.code = code;
  }
}
