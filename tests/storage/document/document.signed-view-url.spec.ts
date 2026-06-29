import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gcs', () => ({
  getSignedViewUrl: vi.fn(),
}));

vi.mock('@/storage/document/document.read', () => ({
  dbDocumentRead: vi.fn(),
}));

import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';
import { dbDocumentRead } from '@/storage/document/document.read';
import { getSignedViewUrl } from '@/integrations/gcs';
import { document } from '../../builders/document.builder';

describe('dbDocumentGetSignedViewUrl', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns a signed URL for the document object key', async () => {
    const doc = document();
    vi.mocked(dbDocumentRead).mockResolvedValueOnce(doc);
    vi.mocked(getSignedViewUrl).mockResolvedValueOnce('https://signed.example/front.jpg');

    const url = await dbDocumentGetSignedViewUrl(doc.id!);

    expect(getSignedViewUrl).toHaveBeenCalledWith(doc.objectKey);
    expect(url).toBe('https://signed.example/front.jpg');
  });
});
