import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/gcs', () => ({
  deleteObject: vi.fn(),
}));

vi.mock('@/storage/document/document.read', () => ({
  dbDocumentRead: vi.fn(),
}));

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { dbDocumentDelete } from '@/storage/document/document.delete';
import { dbDocumentRead } from '@/storage/document/document.read';
import { deleteObject } from '@/integrations/gcs';
import { getPrismaClient } from '@/storage/utils';
import { document } from '../../builders/document.builder';

describe('dbDocumentDelete', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the GCS object then the database row', async () => {
    const doc = document();
    vi.mocked(dbDocumentRead).mockResolvedValueOnce(doc);
    const mockPrisma = {
      document: {
        delete: vi.fn().mockResolvedValue(undefined),
      },
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    await dbDocumentDelete(doc.id!);

    expect(deleteObject).toHaveBeenCalledWith(doc.objectKey);
    expect(mockPrisma.document.delete).toHaveBeenCalledWith({ where: { id: doc.id } });
  });
});
