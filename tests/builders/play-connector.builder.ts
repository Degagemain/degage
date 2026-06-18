import type { DbPlayConnector } from '@/storage/play-connector/play-connector.mappers';

export type PlayConnectorRecord = Partial<DbPlayConnector> & {
  userId: string;
  email: string;
  encryptedPassword: string;
};

export const playConnectorRecord = (data: Partial<PlayConnectorRecord> = {}): PlayConnectorRecord => ({
  id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
  userId: data.userId ?? 'user-1',
  email: data.email ?? 'user@example.com',
  encryptedPassword: data.encryptedPassword ?? 'encrypted-password',
  encryptedSessionCookie: data.encryptedSessionCookie ?? null,
  sessionExpiresAt: data.sessionExpiresAt ?? null,
  credentialsInvalid: data.credentialsInvalid ?? false,
  failedLoginCount: data.failedLoginCount ?? 0,
  loginBlockedUntil: data.loginBlockedUntil ?? null,
  createdAt: data.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: data.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
});
