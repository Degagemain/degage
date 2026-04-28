import type { DocumentationGroup } from '@/domain/documentation-group.model';
import type { DocumentationGroupFilter } from '@/domain/documentation-group.filter';
import { Page } from '@/domain/page.model';
import { dbDocumentationGroupSearch } from '@/storage/documentation-group/documentation-group.search';

export const searchDocumentationGroups = async (filter: DocumentationGroupFilter): Promise<Page<DocumentationGroup>> => {
  return dbDocumentationGroupSearch(filter);
};
