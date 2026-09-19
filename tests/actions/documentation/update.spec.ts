import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.update', () => ({
  dbDocumentationUpdate: vi.fn(),
}));

import { updateDocumentation } from '@/actions/documentation/update';
import { dbDocumentationUpdate } from '@/storage/documentation/documentation.update';
import { documentation } from '../../builders/documentation.builder';

describe('updateDocumentation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a validated document', async () => {
    const updated = documentation();
    vi.mocked(dbDocumentationUpdate).mockResolvedValueOnce(updated);

    const result = await updateDocumentation(updated);

    expect(result).toEqual(updated);
    expect(dbDocumentationUpdate).toHaveBeenCalledTimes(1);
  });

  it('stores only the widest audience role', async () => {
    const updated = documentation({ audienceRoles: ['user'] });
    vi.mocked(dbDocumentationUpdate).mockResolvedValueOnce(updated);

    await updateDocumentation({
      ...updated,
      audienceRoles: ['admin', 'user'],
    });

    expect(dbDocumentationUpdate).toHaveBeenCalledWith(expect.objectContaining({ audienceRoles: ['user'] }));
  });
});
