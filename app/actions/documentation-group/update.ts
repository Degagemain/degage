import * as z from 'zod';
import { type DocumentationGroup, documentationGroupSchema } from '@/domain/documentation-group.model';
import { dbDocumentationGroupUpdate } from '@/storage/documentation-group/documentation-group.update';

export const updateDocumentationGroup = async (group: DocumentationGroup): Promise<DocumentationGroup> => {
  const validated = documentationGroupSchema.parse(group);
  z.uuid().parse(validated.id);
  return dbDocumentationGroupUpdate(validated);
};
