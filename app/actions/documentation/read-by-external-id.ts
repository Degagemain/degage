import type { Documentation } from '@/domain/documentation.model';
import { dbDocumentationGetByExternalId } from '@/storage/documentation/documentation.get-by-external-id';

export const readDocumentationByExternalId = async (externalId: string): Promise<Documentation | null> => {
  return dbDocumentationGetByExternalId(externalId);
};
