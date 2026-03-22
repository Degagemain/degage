import { dbDocumentationDelete } from '@/storage/documentation/documentation.delete';

export const deleteDocumentation = async (id: string): Promise<void> => {
  return dbDocumentationDelete(id);
};
