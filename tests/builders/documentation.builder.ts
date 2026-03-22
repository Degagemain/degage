import type { Documentation } from '@/domain/documentation.model';
import { randomUUID } from 'crypto';

export const documentation = (data: Partial<Documentation> = {}): Documentation => {
  const id = data.id === undefined ? randomUUID() : data.id;
  return {
    id,
    source: data.source ?? 'manual',
    externalId: data.externalId ?? `manual:${randomUUID()}`,
    isFaq: data.isFaq ?? false,
    format: data.format ?? 'markdown',
    audienceRoles: data.audienceRoles ?? ['admin'],
    tags: data.tags ?? [],
    translations: data.translations ?? [
      { locale: 'en', title: 'Test EN', content: 'Body EN' },
      { locale: 'nl', title: 'Test NL', content: 'Body NL' },
      { locale: 'fr', title: 'Test FR', content: 'Body FR' },
    ],
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};
