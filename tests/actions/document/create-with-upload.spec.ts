import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/document/document.create', () => ({
  dbDocumentCreate: vi.fn(),
}));

vi.mock('@/storage/document/document.delete', () => ({
  dbDocumentDelete: vi.fn(),
}));

vi.mock('@/integrations/gcs', () => ({
  putObject: vi.fn(),
}));

import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { DocumentType } from '@/domain/document.model';
import { dbDocumentCreate } from '@/storage/document/document.create';
import { dbDocumentDelete } from '@/storage/document/document.delete';
import { putObject } from '@/integrations/gcs';
import { document } from '../../builders/document.builder';

describe('createDocumentWithUpload', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates the document row then uploads to GCS', async () => {
    const created = document({ id: 'doc-id' });
    vi.mocked(dbDocumentCreate).mockResolvedValueOnce(created);
    vi.mocked(putObject).mockResolvedValueOnce(undefined);

    const body = Buffer.from('file');
    const result = await createDocumentWithUpload({
      type: DocumentType.REGISTRATION_CERTIFICATE,
      fileName: 'front.jpg',
      contentType: 'image/jpeg',
      sizeBytes: body.length,
      body,
    });

    expect(dbDocumentCreate).toHaveBeenCalled();
    expect(putObject).toHaveBeenCalledWith({
      objectKey: created.objectKey,
      body,
      contentType: 'image/jpeg',
    });
    expect(result).toEqual(created);
  });

  it('rolls back the database row when GCS upload fails', async () => {
    const created = document({ id: 'doc-id' });
    vi.mocked(dbDocumentCreate).mockResolvedValueOnce(created);
    vi.mocked(putObject).mockRejectedValueOnce(new Error('upload failed'));

    await expect(
      createDocumentWithUpload({
        type: DocumentType.REGISTRATION_CERTIFICATE,
        fileName: 'front.jpg',
        contentType: 'image/jpeg',
        sizeBytes: 4,
        body: Buffer.from('file'),
      }),
    ).rejects.toThrow('upload failed');

    expect(dbDocumentDelete).toHaveBeenCalledWith('doc-id');
  });
});
