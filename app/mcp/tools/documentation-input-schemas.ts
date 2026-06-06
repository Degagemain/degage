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

export const documentationUpdateBodySchema = documentationSchema.extend({
  id: z.uuid(),
});

export const documentationUpdateMcpInputSchema = {
  id: z.uuid().describe('Documentation UUID. Same as the {id} path segment in PUT /api/documentation/{id}.'),
  source: documentationSourceSchema.describe(`Origin of the article. One of: ${documentationSourceValues.join(', ')}.`),
  externalId: z.string().max(500).describe('Stable external identifier (e.g. notion page id or manual:slug).'),
  isFaq: z.boolean().describe('Whether the article appears in the FAQ catalog.'),
  isPublic: z.boolean().describe('Whether the article is visible in the public documentation catalog.'),
  format: documentationFormatSchema.describe(`Content format. One of: ${documentationFormatValues.join(', ')}.`),
  audienceRoles: z
    .array(documentationAudienceRoleSchema)
    .describe(`Audience roles that may view this article. Values: ${documentationAudienceRoleValues.join(', ')}.`),
  tags: z.array(documentationTagSchema).describe(`Tags for filtering and workflows. Values: ${documentationTagValues.join(', ')}.`),
  groups: z
    .array(idNameSchema)
    .describe('Documentation groups (id required; name optional). Same shape as the groups field on GET /api/documentation/{id}.'),
  translations: z
    .array(documentationTranslationSchema)
    .min(1)
    .describe('All locale translations for the article. Send the full set — this replaces the record like PUT, not a partial patch.'),
  createdAt: z.coerce.date().nullable().optional().describe('Read-only timestamp from GET; may be omitted on update.'),
  updatedAt: z.coerce.date().nullable().optional().describe('Read-only timestamp from GET; may be omitted on update.'),
};

export const documentationSearchMcpInputSchema = {
  query: z.string().nullable().optional().describe('Free-text search in title and content (GET ?query=).'),
  isFaq: z.boolean().nullable().optional().describe('Filter by FAQ flag (GET ?isFaq=true|false). Omit for no filter.'),
  isPublic: z
    .boolean()
    .nullable()
    .optional()
    .describe('Filter by public visibility (GET ?isPublic=true|false). Non-admin callers are always limited to public docs.'),
  sources: z
    .array(documentationSourceSchema)
    .optional()
    .describe(`Filter by source (GET ?source=, repeatable). Values: ${documentationSourceValues.join(', ')}.`),
  tags: z
    .array(documentationTagSchema)
    .optional()
    .describe(`Filter by tag (GET ?tags=, repeatable). Values: ${documentationTagValues.join(', ')}.`),
  formats: z
    .array(documentationFormatSchema)
    .optional()
    .describe(`Filter by format (GET ?format=, repeatable). Values: ${documentationFormatValues.join(', ')}.`),
  groupIds: z.array(z.uuid()).optional().describe('Filter by documentation group UUID (GET ?group= or ?groups=).'),
  audiences: z
    .array(documentationAudienceRoleSchema)
    .optional()
    .describe(`Filter by audience role (GET ?audience=, repeatable). Values: ${documentationAudienceRoleValues.join(', ')}.`),
  skip: z.number().int().min(0).optional().describe('Pagination offset (GET ?skip=, default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (GET ?take=, default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(DocumentationSortColumns)
    .optional()
    .describe(`Sort column (GET ?sortBy=). Values: ${Object.values(DocumentationSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction (GET ?sortOrder=): asc or desc.'),
};
