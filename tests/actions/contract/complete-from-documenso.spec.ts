import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/documenso', () => ({
  isDocumensoConfigured: vi.fn(),
  downloadCompletedEnvelopePdf: vi.fn(),
  DocumensoNotConfiguredError: class DocumensoNotConfiguredError extends Error {},
}));

vi.mock('@/actions/document/create-with-upload', () => ({
  createDocumentWithUpload: vi.fn(),
}));

vi.mock('@/storage/contract/contract.read', () => ({
  dbContractReadByDocumensoEnvelopeId: vi.fn(),
}));

vi.mock('@/storage/contract/contract.update', () => ({
  dbContractMarkSigned: vi.fn(),
}));

import { completeContractFromDocumenso } from '@/actions/contract/complete-from-documenso';
import { createDocumentWithUpload } from '@/actions/document/create-with-upload';
import { ContractStatus } from '@/domain/contract.model';
import { DocumentType } from '@/domain/document.model';
import { downloadCompletedEnvelopePdf, isDocumensoConfigured } from '@/integrations/documenso';
import { dbContractReadByDocumensoEnvelopeId } from '@/storage/contract/contract.read';
import { dbContractMarkSigned } from '@/storage/contract/contract.update';
import { contract } from '../../builders/contract.builder';

describe('completeContractFromDocumenso', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('stores the signed PDF and marks the contract signed', async () => {
    const sent = contract({
      status: ContractStatus.Sent,
      documensoDocumentEnvelopeId: 'envelope_doc',
      document: null,
    });
    const signed = contract({
      ...sent,
      status: ContractStatus.Signed,
      document: {
        id: 'doc-1',
        type: DocumentType.CONTRACT,
        objectKey: 'contract/doc-1/signed.pdf',
        fileName: 'signed.pdf',
        contentType: 'application/pdf',
        sizeBytes: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbContractReadByDocumensoEnvelopeId).mockResolvedValueOnce(sent);
    vi.mocked(downloadCompletedEnvelopePdf).mockResolvedValueOnce({
      fileName: 'signed.pdf',
      body: Buffer.from('%PDF'),
    });
    vi.mocked(createDocumentWithUpload).mockResolvedValueOnce(signed.document!);
    vi.mocked(dbContractMarkSigned).mockResolvedValueOnce(signed);

    const result = await completeContractFromDocumenso({
      event: 'DOCUMENT_COMPLETED',
      payload: { envelopeId: 'envelope_doc' },
    });

    expect(result?.status).toBe(ContractStatus.Signed);
    expect(createDocumentWithUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        type: DocumentType.CONTRACT,
        fileName: 'signed.pdf',
      }),
    );
    expect(dbContractMarkSigned).toHaveBeenCalledWith(sent.id, 'doc-1');
  });

  it('is idempotent when the contract is already signed with a document', async () => {
    const signed = contract({
      status: ContractStatus.Signed,
      documensoDocumentEnvelopeId: 'envelope_doc',
      document: {
        id: 'doc-1',
        type: DocumentType.CONTRACT,
        objectKey: 'contract/doc-1/signed.pdf',
        fileName: 'signed.pdf',
        contentType: 'application/pdf',
        sizeBytes: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    vi.mocked(dbContractReadByDocumensoEnvelopeId).mockResolvedValueOnce(signed);

    const result = await completeContractFromDocumenso({
      event: 'DOCUMENT_COMPLETED',
      payload: { envelopeId: 'envelope_doc' },
    });

    expect(result?.id).toBe(signed.id);
    expect(downloadCompletedEnvelopePdf).not.toHaveBeenCalled();
    expect(createDocumentWithUpload).not.toHaveBeenCalled();
    expect(dbContractMarkSigned).not.toHaveBeenCalled();
  });

  it('ignores non-completion events', async () => {
    const result = await completeContractFromDocumenso({
      event: 'DOCUMENT_SENT',
      payload: { envelopeId: 'envelope_doc' },
    });
    expect(result).toBeNull();
    expect(dbContractReadByDocumensoEnvelopeId).not.toHaveBeenCalled();
  });
});
