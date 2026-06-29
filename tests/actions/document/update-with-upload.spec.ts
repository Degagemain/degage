import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/document/document.read', () => ({
  dbDocumentRead: vi.fn(),
}));

vi.mock('@/storage/document/document.update', () => ({
  dbDocumentUpdate: vi.fn(),
}));

vi.mock('@/integrations/gcs', () => ({
  putObject: vi.fn(),
  deleteObject: vi.fn(),
}));

import { updateDocumentWithUpload } from '@/actions/document/update-with-upload';
import { DocumentType } from '@/domain/document.model';
import { dbDocumentRead } from '@/storage/document/document.read';
import { dbDocumentUpdate } from '@/storage/document/document.update';
import { deleteObject, putObject } from '@/integrations/gcs';
import { document } from '../../builders/document.builder';

describe('updateDocumentWithUpload', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('overwrites the same object key when the file name is unchanged', async () => {
    const existing = document({ fileName: 'front.jpg' });
    const updated = { ...existing, sizeBytes: 8 };
    vi.mocked(dbDocumentRead).mockResolvedValueOnce(existing);
    vi.mocked(dbDocumentUpdate).mockResolvedValueOnce(updated);
    vi.mocked(putObject).mockResolvedValueOnce(undefined);

    const body = Buffer.from('new-file');
    const result = await updateDocumentWithUpload({
      documentId: existing.id!,
      fileName: 'front.jpg',
      contentType: 'image/jpeg',
      sizeBytes: body.length,
      body,
    });

    expect(putObject).toHaveBeenCalledWith({
      objectKey: existing.objectKey,
      body,
      contentType: 'image/jpeg',
    });
    expect(deleteObject).not.toHaveBeenCalled();
    expect(result).toEqual(updated);
  });

  it('deletes the old object key when the file name changes', async () => {
    const existing = document({ fileName: 'front.jpg', type: DocumentType.REGISTRATION_CERTIFICATE });
    const updated = {
      ...existing,
      fileName: 'front-renamed.jpg',
      objectKey: `registrationCertificate/${existing.id}/front-renamed.jpg`,
    };
    vi.mocked(dbDocumentRead).mockResolvedValueOnce(existing);
    vi.mocked(dbDocumentUpdate).mockResolvedValueOnce(updated);
    vi.mocked(putObject).mockResolvedValueOnce(undefined);

    await updateDocumentWithUpload({
      documentId: existing.id!,
      fileName: 'front-renamed.jpg',
      contentType: 'image/jpeg',
      sizeBytes: 4,
      body: Buffer.from('data'),
    });

    expect(deleteObject).toHaveBeenCalledWith(existing.objectKey);
  });

  it('reverts metadata when GCS upload fails', async () => {
    const existing = document();
    vi.mocked(dbDocumentRead).mockResolvedValueOnce(existing);
    vi.mocked(dbDocumentUpdate)
      .mockResolvedValueOnce({ ...existing, sizeBytes: 8 })
      .mockResolvedValueOnce(existing);
    vi.mocked(putObject).mockRejectedValueOnce(new Error('upload failed'));

    await expect(
      updateDocumentWithUpload({
        documentId: existing.id!,
        fileName: existing.fileName,
        contentType: existing.contentType,
        sizeBytes: 8,
        body: Buffer.from('data'),
      }),
    ).rejects.toThrow('upload failed');

    expect(dbDocumentUpdate).toHaveBeenCalledTimes(2);
    expect(dbDocumentUpdate).toHaveBeenLastCalledWith(existing);
  });
});
