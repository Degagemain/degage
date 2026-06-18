import * as z from 'zod';

import { credentialsSchema } from '@/domain/credentials.model';

export const playConnectorStatusValues = ['missing', 'success', 'failing'] as const;

export const playConnectorStatusEnum = z.enum(playConnectorStatusValues);

export type PlayConnectorStatusValue = z.infer<typeof playConnectorStatusEnum>;

export const playConnectorLinkInputSchema = credentialsSchema;

export type PlayConnectorLinkInput = z.infer<typeof playConnectorLinkInputSchema>;

export const playConnectorStatusSchema = z.object({
  status: playConnectorStatusEnum,
  email: z.email().nullable(),
  loginBlockedUntil: z.date().nullable(),
  sessionExpiresAt: z.date().nullable(),
});

export type PlayConnectorStatus = z.infer<typeof playConnectorStatusSchema>;
