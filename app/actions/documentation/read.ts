import type { Documentation } from '@/domain/documentation.model';
import { dbDocumentationRead } from '@/storage/documentation/documentation.read';

export const readDocumentation = async (id: string): Promise<Documentation | null> => {
  return dbDocumentationRead(id);
};
