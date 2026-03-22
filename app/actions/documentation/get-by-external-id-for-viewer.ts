import { canViewDocumentation } from '@/domain/documentation-audience.utils';
import type { ContentLocale } from '@/i18n/locales';
import { defaultContentLocale } from '@/i18n/locales';
import { dbDocumentationGetByExternalId } from '@/storage/documentation/documentation.get-by-external-id';

export type DocumentationViewerPayload = {
  externalId: string;
  source: string;
  format: 'markdown' | 'text';
  title: string;
  content: string;
  locale: string;
};

export type GetDocumentationByExternalIdResult =
  | { ok: true; doc: DocumentationViewerPayload }
  | { ok: false; reason: 'not_found' | 'forbidden' };

export const getDocumentationByExternalIdForViewer = async (
  externalId: string,
  locale: ContentLocale,
  isViewerAdmin: boolean,
): Promise<GetDocumentationByExternalIdResult> => {
  const doc = await dbDocumentationGetByExternalId(externalId);
  if (!doc) {
    return { ok: false, reason: 'not_found' };
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
