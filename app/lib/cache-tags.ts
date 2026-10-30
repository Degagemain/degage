import { revalidateTag } from 'next/cache';

export const cacheTags = {
  documentation: 'documentation',
  translationOverrides: 'translation-overrides',
} as const;

export const expireCacheTag = (tag: (typeof cacheTags)[keyof typeof cacheTags]): void => {
  revalidateTag(tag, { expire: 0 });
};
