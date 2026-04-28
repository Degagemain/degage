import { type DocumentationGroup, documentationGroupSchema } from '@/domain/documentation-group.model';
import { dbDocumentationGroupCreate } from '@/storage/documentation-group/documentation-group.create';

export const createDocumentationGroup = async (group: DocumentationGroup): Promise<DocumentationGroup> => {
  const validated = documentationGroupSchema.parse({
    ...group,
    id: null,
  });
  return dbDocumentationGroupCreate(validated);
};
