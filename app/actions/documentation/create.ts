import { randomUUID } from 'crypto';
import { keepWidestDocumentationAudienceRoles } from '@/domain/documentation-audience.utils';
import { Documentation, documentationSchema } from '@/domain/documentation.model';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { dbDocumentationCreate } from '@/storage/documentation/documentation.create';
import { logger } from '@/lib/logger';
import { DocumentationShortLinkTakenError, isDocumentationShortLinkUniqueError } from './documentation-short-link-taken.error';
import { prepareDocumentationShortLink } from './prepare-documentation-short-link';

export const createDocumentation = async (doc: Documentation): Promise<Documentation> => {
  const externalId = doc.externalId?.trim() ? doc.externalId.trim() : `manual:${randomUUID()}`;
  const validated = documentationSchema.parse({
    ...doc,
    id: null,
    externalId,
  });
  const prepared = await prepareDocumentationShortLink({
    ...validated,
    audienceRoles: keepWidestDocumentationAudienceRoles(validated.audienceRoles),
  });
  let saved: Documentation;
  try {
    saved = await dbDocumentationCreate(prepared);
  } catch (error) {
    if (isDocumentationShortLinkUniqueError(error)) {
      throw new DocumentationShortLinkTakenError();
    }
    throw error;
  }
  if (saved.id) {
    try {
      await embedDocumentationById(saved.id);
    } catch (error) {
      logger.exception(error, { documentationId: saved.id, phase: 'embed-after-save' });
    }
  }
  return saved;
};
