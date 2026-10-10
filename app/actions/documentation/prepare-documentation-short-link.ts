import type { Documentation } from '@/domain/documentation.model';
import { dbDocumentationGetByShortLink } from '@/storage/documentation/documentation.get-by-short-link';
import { DocumentationShortLinkTakenError } from './documentation-short-link-taken.error';

export const prepareDocumentationShortLink = async (doc: Documentation): Promise<Documentation> => {
  if (!doc.shortLink) {
    return doc;
  }
  const existing = await dbDocumentationGetByShortLink(doc.shortLink);
  if (existing && existing.id !== doc.id) {
    throw new DocumentationShortLinkTakenError();
  }
  return doc;
};
