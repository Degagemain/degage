import * as z from 'zod';
import { DocumentationGroupSortColumns } from '@/domain/documentation-group.filter';
import { documentationGroupSchema, documentationGroupTranslationSchema } from '@/domain/documentation-group.model';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

export const documentationGroupCreateBodySchema = documentationGroupSchema.extend({
  id: z.null().default(null),
});

export const documentationGroupUpdateBodySchema = documentationGroupSchema.extend({
  id: z.uuid(),
});

export const documentationGroupCreateMcpInputSchema = {
  order: z.number().int().default(0).describe('Sort order when groups are listed. Lower values appear first.'),
  name: z.string().min(1).max(200).describe('Display name for the current content locale; include full translations for all languages.'),
  translations: z
    .array(documentationGroupTranslationSchema)
    .min(1)
    .describe('Localized group names. Include every supported locale (en, nl, fr).'),
};

export const documentationGroupUpdateMcpInputSchema = {
  id: z.uuid().describe('Documentation group UUID.'),
  order: z.number().int().describe('Sort order when groups are listed. Lower values appear first.'),
  name: z.string().min(1).max(200).describe('Display name for the current content locale; include full translations for all languages.'),
  translations: z
    .array(documentationGroupTranslationSchema)
    .min(1)
    .describe('All locale names for the group. Send the full set — partial updates are not supported.'),
};

export const documentationGroupSearchMcpInputSchema = {
  query: z.string().nullable().optional().describe('Free-text search in group names.'),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(DocumentationGroupSortColumns)
    .optional()
    .describe(`Sort column. Values: ${Object.values(DocumentationGroupSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction: asc or desc.'),
};
