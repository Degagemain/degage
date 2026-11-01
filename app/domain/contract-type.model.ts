import * as z from 'zod';

import { userReferenceSchema } from '@/domain/id-name.model';

export enum ContractTypeCode {
  CarOnboarding = 'car-onboarding',
  Other = 'other',
}

export const contractTypeCodeValues = [ContractTypeCode.CarOnboarding, ContractTypeCode.Other] as const;

export const contractTypeCodeSchema = z.enum(contractTypeCodeValues);
export type ContractTypeCodeValue = z.infer<typeof contractTypeCodeSchema>;

export const CONTRACT_OWNER_PLACEHOLDER_EMAIL = 'owner@contract.placeholder';

export const contractTypeSchema = z
  .object({
    id: z.uuid().nullable(),
    code: contractTypeCodeSchema,
    name: z.string().min(1).max(100),
    defaultSignee: userReferenceSchema.nullable().default(null),
    defaultViewers: z.array(userReferenceSchema).default([]),
    documensoTemplateEnvelopeId: z.string().min(1).max(200).nullable().default(null),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type ContractType = z.infer<typeof contractTypeSchema>;
