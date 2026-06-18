import { afterEach, describe, expect, it, vi } from 'vitest';

import { dbPlayConnectorToStatus } from '@/storage/play-connector/play-connector.mappers';
import { playConnectorRecord } from '../../builders/play-connector.builder';

describe('dbPlayConnectorToStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns missing when row is null', () => {
    expect(dbPlayConnectorToStatus(null)).toEqual({
      status: 'missing',
      email: null,
      loginBlockedUntil: null,
      sessionExpiresAt: null,
    });
  });

  it('returns success for a healthy connector', () => {
    const row = playConnectorRecord({ credentialsInvalid: false, loginBlockedUntil: null });
    expect(dbPlayConnectorToStatus(row)).toMatchObject({
      status: 'success',
      email: row.email,
    });
  });

  it('returns failing when credentials are invalid', () => {
    const row = playConnectorRecord({ credentialsInvalid: true });
    expect(dbPlayConnectorToStatus(row).status).toBe('failing');
  });

  it('returns failing while login backoff is active', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'));

    const row = playConnectorRecord({
      credentialsInvalid: false,
      loginBlockedUntil: new Date('2026-06-18T12:00:10.000Z'),
    });

    expect(dbPlayConnectorToStatus(row).status).toBe('failing');
  });
});
