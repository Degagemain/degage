import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { randomUUID } from 'crypto';

export const documentationGroup = (data: Partial<DocumentationGroup> = {}): DocumentationGroup => {
  const id = data.id === undefined ? randomUUID() : data.id;
  return {
    id,
    order: data.order ?? 0,
    name: data.name ?? 'Test group',
    translations: data.translations ?? [
      { locale: 'en', name: 'Test EN' },
      { locale: 'nl', name: 'Test NL' },
      { locale: 'fr', name: 'Test FR' },
    ],
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};
