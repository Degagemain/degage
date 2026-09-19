import * as z from 'zod';
import { keepWidestDocumentationAudienceRoles } from '@/domain/documentation-audience.utils';
import { Documentation, documentationSchema } from '@/domain/documentation.model';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { dbDocumentationUpdate } from '@/storage/documentation/documentation.update';
import { logger } from '@/lib/logger';

export const updateDocumentation = async (doc: Documentation): Promise<Documentation> => {
  const validated = documentationSchema.parse(doc);
  z.uuid().parse(validated.id);
  const saved = await dbDocumentationUpdate({
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
