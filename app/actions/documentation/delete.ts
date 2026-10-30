import { dbDocumentationDelete } from '@/storage/documentation/documentation.delete';
import { expireDocumentationCache } from './documentation-cache';

export const deleteDocumentation = async (id: string): Promise<void> => {
  await dbDocumentationDelete(id);
  expireDocumentationCache();
};
