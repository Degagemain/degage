import type { Documentation } from '@/domain/documentation.model';
import type { DocumentationFilter } from '@/domain/documentation.filter';
import { Page } from '@/domain/page.model';
import { dbDocumentationSearch } from '@/storage/documentation/documentation.search';

export const searchDocumentation = async (filter: DocumentationFilter, isViewerAdmin: boolean): Promise<Page<Documentation>> => {
  return dbDocumentationSearch(filter, { restrictToPublicAudiences: !isViewerAdmin });
};
