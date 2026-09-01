import * as z from 'zod';
import { DocumentationSortColumns } from '@/domain/documentation.filter';
import {
  documentationAudienceRoleSchema,
  documentationAudienceRoleValues,
  documentationFormatSchema,
  documentationFormatValues,
  documentationSchema,
  documentationSourceSchema,
  documentationSourceValues,
  documentationTagSchema,
  documentationTagValues,
  documentationTranslationSchema,
} from '@/domain/documentation.model';
import { idNameSchema } from '@/domain/id-name.model';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

export const documentationCreateBodySchema = documentationSchema.extend({
  id: z.null().default(null),
});

export const documentationUpdateBodySchema = documentationSchema.extend({
  id: z.uuid(),
});

const documentationMcpSharedFields = {
  source: documentationSourceSchema.describe(`Origin of the article. One of: ${documentationSourceValues.join(', ')}.`),
  externalId: z
    .string()
    .max(500)
    .describe('Stable external identifier (e.g. repo:topic or manual:slug). An empty value is stored as manual:{uuid} on create.'),
  isFaq: z.boolean().describe('Whether the article appears in the FAQ catalog.'),
  isPublic: z.boolean().describe('Whether the article is visible in the public documentation catalog.'),
  format: documentationFormatSchema.describe(`Content format. One of: ${documentationFormatValues.join(', ')}.`),
  audienceRoles: z
    .array(documentationAudienceRoleSchema)
    .describe(`Audience roles that may view this article. Values: ${documentationAudienceRoleValues.join(', ')}.`),
  tags: z.array(documentationTagSchema).describe(`Tags for filtering and workflows. Values: ${documentationTagValues.join(', ')}.`),
  groups: z.array(idNameSchema).describe('Documentation groups to assign (id required; name optional).'),
  translations: z
    .array(documentationTranslationSchema)
    .min(1)
    .describe('All locale translations for the article. Include every supported locale (en, nl, fr). Send the full set.'),
};

export const documentationCreateMcpInputSchema = documentationMcpSharedFields;

export const documentationUpdateMcpInputSchema = {
  id: z.uuid().describe('Documentation UUID.'),
  ...documentationMcpSharedFields,
};

export const documentationSearchMcpInputSchema = {
  query: z.string().nullable().optional().describe('Free-text search in title and content.'),
  isFaq: z.boolean().nullable().optional().describe('Filter by FAQ flag. Omit for no filter.'),
  isPublic: z.boolean().nullable().optional().describe('Filter by public visibility. Non-admin callers are always limited to public docs.'),
  sources: z
    .array(documentationSourceSchema)
    .optional()
    .describe(`Filter by source. Values: ${documentationSourceValues.join(', ')}.`),
  tags: z
    .array(documentationTagSchema)
    .optional()
    .describe(`Filter by tag. Values: ${documentationTagValues.join(', ')}.`),
  formats: z
    .array(documentationFormatSchema)
    .optional()
    .describe(`Filter by format. Values: ${documentationFormatValues.join(', ')}.`),
  groupIds: z.array(z.uuid()).optional().describe('Filter by documentation group UUID.'),
  audiences: z
    .array(documentationAudienceRoleSchema)
    .optional()
    .describe(`Filter by audience role. Values: ${documentationAudienceRoleValues.join(', ')}.`),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(DocumentationSortColumns)
    .optional()
    .describe(`Sort column. Values: ${Object.values(DocumentationSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction: asc or desc.'),
};
