import type { ContentLocale } from '@/i18n/locales';
import { dbDocumentationGetByExternalId } from '@/storage/documentation/documentation.get-by-external-id';
import {
  type DocumentationViewerPayload,
  type GetDocumentationForViewerOptions,
  type GetDocumentationForViewerResult,
  documentationForViewer,
} from './documentation-for-viewer';

export type { DocumentationViewerPayload };
export type GetDocumentationByExternalIdResult = GetDocumentationForViewerResult;
export type GetDocumentationByExternalIdOptions = GetDocumentationForViewerOptions;

export const getDocumentationByExternalIdForViewer = async (
  externalId: string,
  locale: ContentLocale,
  isViewerAdmin: boolean,
  options?: GetDocumentationByExternalIdOptions,
): Promise<GetDocumentationByExternalIdResult> => {
  const doc = await dbDocumentationGetByExternalId(externalId);
  return documentationForViewer(doc, locale, isViewerAdmin, options);
};
