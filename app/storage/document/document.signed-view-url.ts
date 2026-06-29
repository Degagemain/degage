import { getSignedViewUrl } from '@/integrations/gcs';
import { dbDocumentRead } from './document.read';

export const dbDocumentGetSignedViewUrl = async (id: string): Promise<string> => {
  const document = await dbDocumentRead(id);
  return getSignedViewUrl(document.objectKey);
};
