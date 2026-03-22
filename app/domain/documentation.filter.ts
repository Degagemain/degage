import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';
import { documentationFormatSchema, documentationSourceSchema, documentationTagSchema } from './documentation.model';

export enum DocumentationSortColumns {
  UPDATED_AT = 'updatedAt',
  CREATED_AT = 'createdAt',
  EXTERNAL_ID = 'externalId',
  SOURCE = 'source',
  IS_FAQ = 'isFaq',
}

export const documentationFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isFaq: z
      .union([z.boolean(), z.string().transform((v) => v === 'true')])
      .nullable()
      .default(null),
    sources: z.preprocess((val) => {
      if (val === undefined || val === null) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === 'string')
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      return val;
    }, z.array(documentationSourceSchema).optional()),
    tags: z.preprocess((val) => {
      if (val === undefined || val === null) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === 'string')
        return val
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      return val;
    }, z.array(documentationTagSchema).optional()),
    formats: z.preprocess((val) => {
      if (val === undefined || val === null) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === 'string')
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      return val;
    }, z.array(documentationFormatSchema).optional()),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(DocumentationSortColumns) as [string, ...string[]]).default(DocumentationSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type DocumentationFilter = z.infer<typeof documentationFilterSchema>;

const appendMulti = (out: Record<string, string | string[]>, key: 'tags' | 'sources' | 'formats', value: string) => {
  const existing = out[key];
  if (Array.isArray(existing)) {
    existing.push(value);
  } else if (typeof existing === 'string') {
    out[key] = [existing, value];
  } else {
    out[key] = [value];
  }
};

export const documentationFilterFromSearchParams = (params: URLSearchParams): Record<string, string | string[]> => {
  const out: Record<string, string | string[]> = {};
  for (const [key, value] of params.entries()) {
    if (key === 'tags') {
      appendMulti(out, 'tags', value);
      continue;
    }
    if (key === 'source') {
      appendMulti(out, 'sources', value);
      continue;
    }
    if (key === 'format') {
      appendMulti(out, 'formats', value);
      continue;
    }
    out[key] = value;
  }
  return out;
};
