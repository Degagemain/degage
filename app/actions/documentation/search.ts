import type { Documentation } from '@/domain/documentation.model';
import type { DocumentationFilter } from '@/domain/documentation.filter';
import { type DocumentationSearchViewerContext, documentationSearchVisibleAudiences } from '@/domain/documentation-audience.utils';
import { Page } from '@/domain/page.model';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';

export const searchDocumentation = async (
  filter: DocumentationFilter,
  viewer: DocumentationSearchViewerContext,
): Promise<Page<Documentation>> => {
  const visibleAudiences = documentationSearchVisibleAudiences(viewer);
  const requestedAudiences = filter.audiences;
  const audiences =
    requestedAudiences && requestedAudiences.length > 0
      ? requestedAudiences.filter((role) => visibleAudiences.includes(role))
      : visibleAudiences;

  if (requestedAudiences && requestedAudiences.length > 0 && audiences.length === 0) {
    return { records: [], total: 0 };
  }

  return dbDocumentationSearch({
    ...filter,
    audiences,
  });
};
