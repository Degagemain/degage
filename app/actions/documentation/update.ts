import * as z from 'zod';
import { Documentation, documentationSchema } from '@/domain/documentation.model';
import { dbDocumentationUpdate } from '@/storage/documentation/documentation.update';

export const updateDocumentation = async (doc: Documentation): Promise<Documentation> => {
  const validated = documentationSchema.parse(doc);
  z.uuid().parse(validated.id);
  return dbDocumentationUpdate(validated);
};
