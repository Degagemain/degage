import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/documenso', () => ({
  isDocumensoConfigured: vi.fn(),
  getEnvelope: vi.fn(),
  redistributeEnvelope: vi.fn(),
  DocumensoNotConfiguredError: class DocumensoNotConfiguredError extends Error {},
}));

vi.mock('@/storage/contract/contract.read', () => ({
  dbContractRead: vi.fn(),
}));

import { resendContract } from '@/actions/contract/resend';
import { ContractAlreadySignedError, ContractNotSentError } from '@/actions/contract/contract.error';
import { ContractStatus } from '@/domain/contract.model';
import { getEnvelope, isDocumensoConfigured, redistributeEnvelope } from '@/integrations/documenso';
import { dbContractRead } from '@/storage/contract/contract.read';
import { contract } from '../../builders/contract.builder';

describe('resendContract', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redistributes unsigned signers for a sent contract', async () => {
    const sent = contract({
      status: ContractStatus.Sent,
      documensoDocumentEnvelopeId: 'envelope_doc',
    });
    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbContractRead).mockResolvedValueOnce(sent);
    vi.mocked(getEnvelope).mockResolvedValueOnce({
      id: 'envelope_doc',
      recipients: [
        { id: 1, email: 'owner@example.com', name: 'Owner', role: 'SIGNER', signingStatus: 'NOT_SIGNED' },
        { id: 2, email: 'viewer@example.com', name: 'Viewer', role: 'CC', signingStatus: 'OPENED' },
        { id: 3, email: 'done@example.com', name: 'Done', role: 'SIGNER', signingStatus: 'SIGNED' },
      ],
    });

    const result = await resendContract(sent.id!);

    expect(result).toEqual(sent);
    expect(redistributeEnvelope).toHaveBeenCalledWith('envelope_doc', [1]);
  });

  it('rejects draft contracts', async () => {
    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbContractRead).mockResolvedValueOnce(contract({ status: ContractStatus.Draft }));

    await expect(resendContract('550e8400-e29b-41d4-a716-446655440020')).rejects.toBeInstanceOf(ContractNotSentError);
  });

  it('rejects signed contracts', async () => {
    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbContractRead).mockResolvedValueOnce(contract({ status: ContractStatus.Signed }));

    await expect(resendContract('550e8400-e29b-41d4-a716-446655440020')).rejects.toBeInstanceOf(ContractAlreadySignedError);
  });
});
