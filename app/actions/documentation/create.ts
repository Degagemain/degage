import { randomUUID } from 'crypto';
import { keepWidestDocumentationAudienceRoles } from '@/domain/documentation-audience.utils';
import { Documentation, documentationSchema } from '@/domain/documentation.model';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { dbDocumentationCreate } from '@/storage/documentation/documentation.create';
import { logger } from '@/lib/logger';

export const createDocumentation = async (doc: Documentation): Promise<Documentation> => {
  const externalId = doc.externalId?.trim() ? doc.externalId.trim() : `manual:${randomUUID()}`;
  const validated = documentationSchema.parse({
    ...doc,
    id: null,
    externalId,
  });
  const saved = await dbDocumentationCreate({
    ...validated,
    audienceRoles: keepWidestDocumentationAudienceRoles(validated.audienceRoles),
  });
  if (saved.id) {
    try {
      await embedDocumentationById(saved.id);
    } catch (error) {
      logger.exception(error, { documentationId: saved.id, phase: 'embed-after-save' });
    }
  }
  return saved;
};
