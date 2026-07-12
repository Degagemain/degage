import * as z from 'zod';
import { TownSortColumns } from '@/domain/town.filter';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

export const townSearchMcpInputSchema = {
  query: z.string().nullable().optional().describe('Free-text search in zip, town name, or municipality.'),
  provinceId: z.uuid().nullable().optional().describe('Filter by province UUID. Omit for no filter.'),
  hubId: z.uuid().nullable().optional().describe('Filter by hub UUID. Omit for no filter.'),
  highDemand: z.boolean().nullable().optional().describe('Filter by high-demand flag. Omit for no filter.'),
  hasActiveMembers: z.boolean().nullable().optional().describe('Filter by active-members flag. Omit for no filter.'),
  skip: z.number().int().min(0).optional().describe('Pagination offset (default 0).'),
  take: z.number().int().min(0).max(MaxTake).optional().describe(`Page size (default ${DefaultTake}, max ${MaxTake}).`),
  sortBy: z
    .nativeEnum(TownSortColumns)
    .optional()
    .describe(`Sort column. Values: ${Object.values(TownSortColumns).join(', ')}.`),
  sortOrder: z.nativeEnum(SortOrder).optional().describe('Sort direction: asc or desc.'),
};
