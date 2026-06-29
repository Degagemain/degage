import { deleteObject } from '@/integrations/gcs';
import { getPrismaClient } from '@/storage/utils';
import { dbDocumentRead } from './document.read';

export const dbDocumentDelete = async (id: string): Promise<void> => {
  const document = await dbDocumentRead(id);
  await deleteObject(document.objectKey);
  const prisma = getPrismaClient();
  await prisma.document.delete({
    where: { id },
  });
};
