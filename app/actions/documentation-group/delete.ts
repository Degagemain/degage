import { dbDocumentationGroupDelete } from '@/storage/documentation-group/documentation-group.delete';

export const deleteDocumentationGroup = async (id: string): Promise<void> => {
  return dbDocumentationGroupDelete(id);
};
