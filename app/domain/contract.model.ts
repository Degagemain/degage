import * as z from 'zod';

import { documentSchema } from '@/domain/document.model';
import { idNameSchema, userReferenceSchema } from '@/domain/id-name.model';
import { contractTypeCodeSchema } from '@/domain/contract-type.model';

export enum ContractStatus {
  Draft = 'draft',
  Sent = 'sent',
  Signed = 'signed',
}

export const contractStatusValues = [ContractStatus.Draft, ContractStatus.Sent, ContractStatus.Signed] as const;

export const contractStatusSchema = z.enum(contractStatusValues);
export type ContractStatusValue = z.infer<typeof contractStatusSchema>;

export const contractTypeReferenceSchema = idNameSchema.extend({
  code: contractTypeCodeSchema.optional(),
});

export const contractSchema = z
  .object({
    id: z.uuid().nullable(),
    user: userReferenceSchema,
    type: contractTypeReferenceSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().default(null),
    status: contractStatusSchema.default(ContractStatus.Draft),
    document: documentSchema.nullable().default(null),
    documensoDocumentEnvelopeId: z.string().min(1).max(200).nullable().default(null),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type Contract = z.infer<typeof contractSchema>;
