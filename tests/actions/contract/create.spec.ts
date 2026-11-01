import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/contract/contract.create', () => ({
  dbContractCreate: vi.fn(),
}));

import { createContract } from '@/actions/contract/create';
import { dbContractCreate } from '@/storage/contract/contract.create';
import { ContractStatus } from '@/domain/contract.model';
import { contract } from '../../builders/contract.builder';
import { DocumentType } from '@/domain/document.model';

describe('createContract', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a draft contract with no document', async () => {
    const created = contract({ id: 'new-id', status: ContractStatus.Draft, document: null });
    vi.mocked(dbContractCreate).mockResolvedValueOnce(created);

    const result = await createContract({
      ...created,
      id: null,
      status: ContractStatus.Signed,
      document: {
        id: 'doc-1',
        type: DocumentType.CONTRACT,
        objectKey: 'x',
        fileName: 'a.pdf',
        contentType: 'application/pdf',
        sizeBytes: 1,
        createdAt: null,
        updatedAt: null,
      },
      documensoDocumentEnvelopeId: 'envelope_x',
    });

    expect(result.status).toBe(ContractStatus.Draft);
    expect(dbContractCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ContractStatus.Draft,
        document: null,
        documensoDocumentEnvelopeId: null,
      }),
    );
  });
});
