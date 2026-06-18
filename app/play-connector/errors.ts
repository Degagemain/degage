export type PlayConnectorErrorCode = 'login_failed' | 'fetch_failed';

export class PlayConnectorError extends Error {
  readonly code: PlayConnectorErrorCode;

  constructor(code: PlayConnectorErrorCode, message: string) {
    super(message);
    this.name = 'PlayConnectorError';
    this.code = code;
  }
}
