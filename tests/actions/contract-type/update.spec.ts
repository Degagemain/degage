import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/contract-type/contract-type.read', () => ({
  dbContractTypeRead: vi.fn(),
}));

vi.mock('@/storage/contract-type/contract-type.update', () => ({
  dbContractTypeUpdate: vi.fn(),
}));

vi.mock('@/storage/user/user.read', () => ({
  dbUserRead: vi.fn(),
}));

vi.mock('@/integrations/documenso', () => ({
  isDocumensoConfigured: vi.fn(),
  syncEnvelopeRecipients: vi.fn(),
  buildTemplateRecipients: vi.fn((input) => {
    const recipients = [{ email: 'owner@contract.placeholder', name: 'Owner', role: 'SIGNER', signingOrder: 1 }];
    if (input.defaultSignee) {
      recipients.push({
        email: input.defaultSignee.email,
        name: input.defaultSignee.name,
        role: 'SIGNER',
        signingOrder: 2,
      });
    }
    for (const viewer of input.defaultViewers ?? []) {
      recipients.push({
        email: viewer.email,
        name: viewer.name,
        role: 'CC',
        signingOrder: recipients.length + 1,
      });
    }
    return recipients;
  }),
  DocumensoNotConfiguredError: class DocumensoNotConfiguredError extends Error {},
}));

import { updateContractType } from '@/actions/contract-type/update';
import { isDocumensoConfigured, syncEnvelopeRecipients } from '@/integrations/documenso';
import { dbContractTypeRead } from '@/storage/contract-type/contract-type.read';
import { dbContractTypeUpdate } from '@/storage/contract-type/contract-type.update';
import { dbUserRead } from '@/storage/user/user.read';
import { contractType } from '../../builders/contract-type.builder';

describe('updateContractType', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('syncs Documenso recipients when default signee/viewers change and a template exists', async () => {
    const existing = contractType({
      defaultSignee: null,
      defaultViewers: [],
      documensoTemplateEnvelopeId: 'envelope_template',
    });
    const next = contractType({
      ...existing,
      defaultSignee: { id: 'admin-1', name: 'John' },
      defaultViewers: [{ id: 'admin-2', name: 'Viewer' }],
    });

    vi.mocked(dbContractTypeRead).mockResolvedValueOnce(existing);
    vi.mocked(isDocumensoConfigured).mockReturnValue(true);
    vi.mocked(dbUserRead)
      .mockResolvedValueOnce({
        id: 'admin-1',
        name: 'John',
        email: 'john@degage.be',
        emailVerified: true,
        image: null,
        locale: 'en',
        role: 'admin',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce({
        id: 'admin-2',
        name: 'Viewer',
        email: 'viewer@degage.be',
        emailVerified: true,
        image: null,
        locale: 'en',
        role: 'admin',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    vi.mocked(syncEnvelopeRecipients).mockResolvedValueOnce({ toCreate: [], toUpdate: [], toDelete: [] });
    vi.mocked(dbContractTypeUpdate).mockResolvedValueOnce(next);

    await updateContractType(next);

    expect(syncEnvelopeRecipients).toHaveBeenCalledWith(
      'envelope_template',
      expect.arrayContaining([
        expect.objectContaining({ email: 'john@degage.be', role: 'SIGNER' }),
        expect.objectContaining({ email: 'viewer@degage.be', role: 'CC' }),
      ]),
    );
    expect(dbContractTypeUpdate).toHaveBeenCalledTimes(1);
  });

  it('does not sync when recipients are unchanged', async () => {
    const existing = contractType({
      defaultSignee: { id: 'admin-1', name: 'John' },
      documensoTemplateEnvelopeId: 'envelope_template',
    });
    const next = contractType({
      ...existing,
      code: 'fleet-agreement',
    });

    vi.mocked(dbContractTypeRead).mockResolvedValueOnce(existing);
    vi.mocked(dbContractTypeUpdate).mockResolvedValueOnce(next);

    await updateContractType(next);

    expect(syncEnvelopeRecipients).not.toHaveBeenCalled();
    expect(dbContractTypeUpdate).toHaveBeenCalledWith(expect.objectContaining({ code: existing.code }));
  });
});
