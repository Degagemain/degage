import * as z from 'zod';

import { parsePlayInfosessionRegistrations, parsePlayInfosessionScheduledAt } from '@/domain/play-infosession.parse';

export const playInfosessionRawSchema = z.object({
  scheduledAt: z.string().min(1),
  district: z.string(),
  type: z.string(),
  registrations: z.string().min(1),
  host: z.string(),
  enrollId: z.string().nullable(),
  enrollUrl: z.string().url().nullable(),
});

export type PlayInfosessionRaw = z.infer<typeof playInfosessionRawSchema>;

export const playInfosessionSchema = playInfosessionRawSchema.transform((raw) => {
  const { enrolled, maxRegistrations, isFull } = parsePlayInfosessionRegistrations(raw.registrations);

  return {
    scheduledAt: parsePlayInfosessionScheduledAt(raw.scheduledAt),
    district: raw.district,
    type: raw.type,
    enrolled,
    maxRegistrations,
    isFull,
    host: raw.host,
    enrollId: raw.enrollId,
    enrollUrl: raw.enrollUrl,
  };
});

export type PlayInfosession = z.infer<typeof playInfosessionSchema>;
