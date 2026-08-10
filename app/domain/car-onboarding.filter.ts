import * as z from 'zod';

import { CarOnboardingCarValueStatus, CarOnboardingInPreparationStatus, CarOnboardingInsurerStatus } from '@/domain/car-onboarding.model';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarOnboardingSortColumns {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS_IN_PREPARATION = 'statusInPreparation',
}

export const carOnboardingFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    carName: z.string().nullable().default(null),
    excludeId: z.uuid().nullable().default(null),
    statusInPreparation: z.array(z.enum(CarOnboardingInPreparationStatus)).default([]),
    carValueStatuses: z.array(z.enum(CarOnboardingCarValueStatus)).default([]),
    insurerStatuses: z.array(z.enum(CarOnboardingInsurerStatus)).default([]),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarOnboardingSortColumns) as [string, ...string[]]).default(CarOnboardingSortColumns.CREATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type CarOnboardingFilter = z.infer<typeof carOnboardingFilterSchema>;
