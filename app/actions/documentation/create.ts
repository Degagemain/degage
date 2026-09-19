import { randomUUID } from 'crypto';
import { keepWidestDocumentationAudienceRoles } from '@/domain/documentation-audience.utils';
import { Documentation, documentationSchema } from '@/domain/documentation.model';
import { dbDocumentationCreate } from '@/storage/documentation/documentation.create';

export const createDocumentation = async (doc: Documentation): Promise<Documentation> => {
  const externalId = doc.externalId?.trim() ? doc.externalId.trim() : `manual:${randomUUID()}`;
  const validated = documentationSchema.parse({
    ...doc,
    id: null,
    externalId,
  });
  return dbDocumentationCreate({
    ...validated,
    audienceRoles: keepWidestDocumentationAudienceRoles(validated.audienceRoles),
  });
};
