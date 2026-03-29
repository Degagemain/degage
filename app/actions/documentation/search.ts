import type { Documentation } from '@/domain/documentation.model';
import type { DocumentationFilter } from '@/domain/documentation.filter';
import { type DocumentationSearchViewerContext, documentationSearchVisibleAudiences } from '@/domain/documentation-audience.utils';
import { Page } from '@/domain/page.model';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';

export const searchDocumentation = async (
  filter: DocumentationFilter,
  viewer: DocumentationSearchViewerContext,
): Promise<Page<Documentation>> => {
  return dbDocumentationSearch({
    ...filter,
    audiences: documentationSearchVisibleAudiences(viewer),
  });
};
