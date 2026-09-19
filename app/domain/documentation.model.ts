import * as z from 'zod';
import { idNameSchema } from './id-name.model';
import { roleValues } from './role.model';

export const documentationSourceValues = ['repository', 'manual'] as const;
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
  'public_faq',
  'simulation_step_1',
  'simulation_step_2_approved',
  'simulation_step_2_rejected',
  'simulation_step_2_review',
  'simulation_step_3',
  'simulation_step_4',
  'car_onboarding_all',
  'car_onboarding_play_connector',
  'car_onboarding_info_session',
  'car_onboarding_user_info',
  'car_onboarding_car_info',
  'car_onboarding_insurer',
  'car_onboarding_road_assistance_plan',
  'car_onboarding_car_value',
  'car_onboarding_car_stickers',
  'car_onboarding_share_start',
] as const;

export const documentationTagSchema = z.enum(documentationTagValues);
export type DocumentationTag = z.infer<typeof documentationTagSchema>;
export const PUBLIC_FAQ_TAG = 'public_faq' satisfies DocumentationTag;

export const defaultDocumentationTags = (isFaq: boolean, tags: DocumentationTag[]): DocumentationTag[] =>
  isFaq && tags.length === 0 ? [PUBLIC_FAQ_TAG] : tags;

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
    groups: z.array(idNameSchema).default([]),
    translations: z.array(documentationTranslationSchema).min(1),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type Documentation = z.infer<typeof documentationSchema>;

export const canDeleteDocumentation = (doc: Pick<Documentation, 'id' | 'source'>): boolean => doc.source === 'manual' && Boolean(doc.id);
