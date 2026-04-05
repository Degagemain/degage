import { Page } from '@/domain/page.model';
import { MaxTake } from '@/domain/utils';

type PaginationFilter = { skip: number; take: number };

export const pageAll = async <T, TFilter extends Record<string, unknown>>(
  search: (filter: TFilter & PaginationFilter) => Promise<Page<T>>,
  filter: TFilter,
  batch: number = MaxTake,
): Promise<T[]> => {
  const out: T[] = [];
  for (let skip = 0; ; skip += batch) {
    const page = await search({ ...filter, skip, take: batch });
    out.push(...page.records);
    if (page.records.length < batch || out.length >= page.total) break;
  }
  return out;
};

export const getSupportReplyToEmail = (): string => {
  return process.env.SUPPORT_REPLY_TO_EMAIL!;
};
