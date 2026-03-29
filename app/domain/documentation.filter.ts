import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';
import {
  documentationAudienceRoleSchema,
  documentationFormatSchema,
  documentationSourceSchema,
  documentationTagSchema,
} from './documentation.model';

export enum DocumentationSortColumns {
  UPDATED_AT = 'updatedAt',
  CREATED_AT = 'createdAt',
  EXTERNAL_ID = 'externalId',
  SOURCE = 'source',
  IS_FAQ = 'isFaq',
}

const optionalRepeatedParam = <T extends z.ZodTypeAny>(item: T) =>
  z.preprocess((val) => {
    if (val == null) return undefined;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const t = val.trim();
      return t === '' ? undefined : [t];
    }
    return val;
  }, z.array(item).optional());

export const documentationFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    isFaq: z.boolean().nullable().default(null),
    sources: optionalRepeatedParam(documentationSourceSchema),
    tags: optionalRepeatedParam(documentationTagSchema),
    formats: optionalRepeatedParam(documentationFormatSchema),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.nativeEnum(DocumentationSortColumns).default(DocumentationSortColumns.UPDATED_AT),
    sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
    audiences: optionalRepeatedParam(documentationAudienceRoleSchema).optional(),
  })
  .strict();

export type DocumentationFilter = z.infer<typeof documentationFilterSchema>;

type RawDocumentationFilterParams = Record<string, string | string[] | boolean>;

const appendMulti = (out: RawDocumentationFilterParams, key: 'tags' | 'sources' | 'formats' | 'audiences', value: string) => {
  const existing = out[key];
  if (Array.isArray(existing)) {
    existing.push(value);
  } else if (typeof existing === 'string') {
    out[key] = [existing, value];
  } else {
    out[key] = [value];
  }
};

export const documentationFilterFromSearchParams = (params: URLSearchParams): RawDocumentationFilterParams => {
  const out: RawDocumentationFilterParams = {};
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
    if (key === 'audience') {
      appendMulti(out, 'audiences', value);
      continue;
    }
    if (key === 'isFaq') {
      const t = value.trim();
      if (t === 'true') out.isFaq = true;
      else if (t === 'false') out.isFaq = false;
      else if (t !== '') out.isFaq = value;
      continue;
    }
    out[key] = value;
  }
  return out;
};
