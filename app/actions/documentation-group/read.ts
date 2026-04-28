import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { dbDocumentationGroupRead } from '@/storage/documentation-group/documentation-group.read';

export const readDocumentationGroup = async (id: string): Promise<DocumentationGroup> => {
  return dbDocumentationGroupRead(id);
};
