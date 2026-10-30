import { dbDocumentationDelete } from '@/storage/documentation/documentation.delete';
import { cacheTags, expireCacheTag } from '@/lib/cache-tags';

export const deleteDocumentation = async (id: string): Promise<void> => {
  await dbDocumentationDelete(id);
  expireCacheTag(cacheTags.documentation);
};
