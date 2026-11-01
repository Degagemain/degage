import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/documenso', () => ({
  isDocumensoConfigured: vi.fn(),
  getEnvelope: vi.fn(),
  createDocumentFromTemplate: vi.fn(),
  mapTemplateRecipientsForOwner: vi.fn(),
  DocumensoNotConfiguredError: class DocumensoNotConfiguredError extends Error {},
}));

vi.mock('@/storage/contract/contract.read', () => ({
  dbContractRead: vi.fn(),
}));

vi.mock('@/storage/contract/contract.update', () => ({
  dbContractMarkSent: vi.fn(),
}));

vi.mock('@/storage/contract-type/contract-type.read', () => ({
  dbContractTypeRead: vi.fn(),
}));

vi.mock('@/storage/user/user.read', () => ({
  dbUserRead: vi.fn(),
}));

import { sendContract } from '@/actions/contract/send';
import { ContractNotDraftError, ContractTemplateMissingError } from '@/actions/contract/contract.error';
import { ContractStatus } from '@/domain/contract.model';
import { createDocumentFromTemplate, getEnvelope, isDocumensoConfigured, mapTemplateRecipientsForOwner } from '@/integrations/documenso';
import { dbContractRead } from '@/storage/contract/contract.read';
import { dbContractMarkSent } from '@/storage/contract/contract.update';
import { dbContractTypeRead } from '@/storage/contract-type/contract-type.read';
import { dbUserRead } from '@/storage/user/user.read';
import { contract } from '../../builders/contract.builder';
import { contractType } from '../../builders/contract-type.builder';

describe('sendContract', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends a draft contract through Documenso and marks it sent', async () => {
    const draft = contract({ status: ContractStatus.Draft });
    const type = contractType({
      id: draft.type.id,
      documensoTemplateEnvelopeId: 'envelope_template',
    });
    const sent = contract({ ...draft, status: ContractStatus.Sent, documensoDocumentEnvelopeId: 'envelope_doc' });

    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbContractRead).mockResolvedValueOnce(draft);
    vi.mocked(dbContractTypeRead).mockResolvedValueOnce(type);
    vi.mocked(dbUserRead).mockResolvedValueOnce({
      id: draft.user.id,
      name: 'Owner',
      email: 'owner@example.com',
      emailVerified: true,
      image: null,
      locale: 'en',
      role: null,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getEnvelope).mockResolvedValueOnce({
      id: 'envelope_template',
      recipients: [{ id: 1, email: 'owner@contract.placeholder', name: 'Owner', role: 'SIGNER' }],
    });
    vi.mocked(mapTemplateRecipientsForOwner).mockReturnValueOnce([{ id: 1, email: 'owner@example.com', name: 'Owner' }]);
    vi.mocked(createDocumentFromTemplate).mockResolvedValueOnce({ id: 'envelope_doc' });
    vi.mocked(dbContractMarkSent).mockResolvedValueOnce(sent);

    const result = await sendContract(draft.id!);

    expect(result.status).toBe(ContractStatus.Sent);
    expect(createDocumentFromTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        templateEnvelopeId: 'envelope_template',
        externalId: draft.id,
        distributeDocument: true,
      }),
    );
    expect(dbContractMarkSent).toHaveBeenCalledWith(draft.id, 'envelope_doc');
  });

  it('rejects non-draft contracts', async () => {
    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbContractRead).mockResolvedValueOnce(contract({ status: ContractStatus.Sent }));

    await expect(sendContract('550e8400-e29b-41d4-a716-446655440020')).rejects.toBeInstanceOf(ContractNotDraftError);
  });

  it('rejects when the type has no Documenso template', async () => {
    const draft = contract({ status: ContractStatus.Draft });
    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbContractRead).mockResolvedValueOnce(draft);
    vi.mocked(dbContractTypeRead).mockResolvedValueOnce(contractType({ id: draft.type.id, documensoTemplateEnvelopeId: null }));

    await expect(sendContract(draft.id!)).rejects.toBeInstanceOf(ContractTemplateMissingError);
  });
});
