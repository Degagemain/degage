import { revalidateTag } from 'next/cache';

export const documentationCacheTag = 'documentation';

export const expireDocumentationCache = (): void => {
  revalidateTag(documentationCacheTag, { expire: 0 });
};
