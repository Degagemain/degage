import * as z from 'zod';
import { roleValues } from './role.model';

export const documentationSourceValues = ['repository', 'notion', 'manual'] as const;
export const documentationSourceSchema = z.enum(documentationSourceValues);
export type DocumentationSource = z.infer<typeof documentationSourceSchema>;

export const documentationFormatValues = ['markdown', 'text'] as const;
export const documentationFormatSchema = z.enum(documentationFormatValues);
export type DocumentationFormat = z.infer<typeof documentationFormatSchema>;

export const documentationAudienceRoleValues = [...roleValues, 'public'] as const;
export const documentationAudienceRoleSchema = z.enum(documentationAudienceRoleValues);
export type DocumentationAudienceRole = z.infer<typeof documentationAudienceRoleSchema>;
export const documentationAudienceRolesInputSchema = z.array(documentationAudienceRoleSchema).default([]);

export const documentationTagValues = [
  'simulation_step_1',
  'simulation_step_2_approved',
  'simulation_step_2_rejected',
  'simulation_step_2_review',
  'simulation_step_3',
  'simulation_step_4',
] as const;

export const documentationTagSchema = z.enum(documentationTagValues);
export type DocumentationTag = z.infer<typeof documentationTagSchema>;

export const documentationTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  title: z.string().min(1).max(500),
  content: z.string(),
});

export type DocumentationTranslation = z.infer<typeof documentationTranslationSchema>;

export const documentationSchema = z
  .object({
    id: z.uuid().nullable(),
    source: documentationSourceSchema,
    externalId: z.string().max(500),
    isFaq: z.boolean().default(false),
    isPublic: z.boolean().default(false),
    format: documentationFormatSchema,
    audienceRoles: documentationAudienceRolesInputSchema,
    tags: z.array(documentationTagSchema).default([]),
    translations: z.array(documentationTranslationSchema).min(1),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type Documentation = z.infer<typeof documentationSchema>;
