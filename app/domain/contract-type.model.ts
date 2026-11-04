import * as z from 'zod';

import { userReferenceSchema } from '@/domain/id-name.model';

/** Codes the app looks up. Admins can create additional codes. */
export const ContractTypeCode = {
  CarOnboarding: 'car-onboarding',
} as const;

export const CONTRACT_TYPE_CODE_MAX_LENGTH = 100;
export const contractTypeCodePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const contractTypeCodeSchema = z.string().trim().toLowerCase().min(1).max(CONTRACT_TYPE_CODE_MAX_LENGTH).regex(contractTypeCodePattern);
export type ContractTypeCodeValue = z.infer<typeof contractTypeCodeSchema>;

export const CONTRACT_OWNER_PLACEHOLDER_EMAIL = 'owner@contract.placeholder';

export const contractTypeSchema = z
  .object({
    id: z.uuid().nullable(),
    code: contractTypeCodeSchema,
    defaultSignee: userReferenceSchema.nullable().default(null),
    defaultViewers: z.array(userReferenceSchema).default([]),
    documensoTemplateEnvelopeId: z.string().min(1).max(200).nullable().default(null),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type ContractType = z.infer<typeof contractTypeSchema>;
