import { canViewDocumentation } from '@/domain/documentation-audience.utils';
import type { Documentation } from '@/domain/documentation.model';
import type { ContentLocale } from '@/i18n/locales';
import { defaultContentLocale } from '@/i18n/locales';

export type DocumentationViewerPayload = {
  externalId: string;
  source: string;
  format: 'markdown' | 'text';
  title: string;
  content: string;
  locale: string;
};

export type GetDocumentationForViewerResult = { ok: true; doc: DocumentationViewerPayload } | { ok: false; reason: 'not_found' | 'forbidden' };

export type GetDocumentationForViewerOptions = {
  /** When true, non-public docs are forbidden even for admins (e.g. help center /faq). */
  publicCatalogOnly?: boolean;
};

export const documentationForViewer = (
  doc: Documentation | null,
  locale: ContentLocale,
  isViewerAdmin: boolean,
  options?: GetDocumentationForViewerOptions,
): GetDocumentationForViewerResult => {
  if (!doc) {
    return { ok: false, reason: 'not_found' };
  }
  if (!doc.isPublic && (!isViewerAdmin || options?.publicCatalogOnly)) {
    return { ok: false, reason: 'forbidden' };
  }
  if (!canViewDocumentation(doc.audienceRoles, isViewerAdmin)) {
    return { ok: false, reason: 'forbidden' };
  }
  const translation =
    doc.translations.find((t) => t.locale === locale) ?? doc.translations.find((t) => t.locale === defaultContentLocale) ?? doc.translations[0];
  if (!translation) {
    return { ok: false, reason: 'not_found' };
  }
  return {
    ok: true,
    doc: {
      externalId: doc.externalId,
      source: doc.source,
      format: doc.format,
      title: translation.title,
      content: translation.content,
      locale: translation.locale,
    },
  };
};
