import type { Documentation } from '@/domain/documentation.model';
import { contentLocales } from '@/i18n/locales';

export const emptyManualDocumentation = (): Documentation => ({
  id: null,
  source: 'manual',
  externalId: '',
  isFaq: false,
  isPublic: false,
  format: 'markdown',
  audienceRoles: [],
  tags: [],
  groups: [],
  translations: contentLocales.map((locale) => ({
    locale,
    title: '',
    content: '',
  })),
  createdAt: null,
  updatedAt: null,
});
