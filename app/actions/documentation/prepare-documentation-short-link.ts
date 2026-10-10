import { documentationWithPublicShortLink } from '@/domain/documentation-short-link';
import type { Documentation } from '@/domain/documentation.model';
import { dbDocumentationGetByShortLink } from '@/storage/documentation/documentation.get-by-short-link';
import { DocumentationShortLinkTakenError } from './documentation-short-link-taken.error';

export const prepareDocumentationShortLink = async (doc: Documentation): Promise<Documentation> => {
  const prepared = documentationWithPublicShortLink(doc);
  if (!prepared.shortLink) {
    return prepared;
  }
  const existing = await dbDocumentationGetByShortLink(prepared.shortLink);
  if (existing && existing.id !== prepared.id) {
    throw new DocumentationShortLinkTakenError();
  }
  return prepared;
};
