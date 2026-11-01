import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/contract-type/contract-type.create', () => ({
  dbContractTypeCreate: vi.fn(),
}));

import { createContractType } from '@/actions/contract-type/create';
import { dbContractTypeCreate } from '@/storage/contract-type/contract-type.create';
import { contractType } from '../../builders/contract-type.builder';

describe('createContractType', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a validated contract type without a Documenso template', async () => {
    const created = contractType({ id: 'new-id', documensoTemplateEnvelopeId: null });
    vi.mocked(dbContractTypeCreate).mockResolvedValueOnce(created);

    const result = await createContractType({
      ...created,
      id: null,
      documensoTemplateEnvelopeId: 'envelope_should_be_cleared',
    });

    expect(result.id).toBe('new-id');
    expect(dbContractTypeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        documensoTemplateEnvelopeId: null,
      }),
    );
  });

  it('rejects an invalid payload', async () => {
    await expect(createContractType({ ...contractType(), name: '' })).rejects.toThrow();
    expect(dbContractTypeCreate).not.toHaveBeenCalled();
  });
});
