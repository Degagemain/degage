import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.create', () => ({
  dbDocumentationCreate: vi.fn(),
}));

import { createDocumentation } from '@/actions/documentation/create';
import { dbDocumentationCreate } from '@/storage/documentation/documentation.create';
import { documentation } from '../../builders/documentation.builder';

describe('createDocumentation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a validated document', async () => {
    const created = documentation({ id: 'new-id' });
    vi.mocked(dbDocumentationCreate).mockResolvedValueOnce(created);

    const result = await createDocumentation({ ...created, id: null });

    expect(result.id).toBe('new-id');
    expect(dbDocumentationCreate).toHaveBeenCalledTimes(1);
  });

  it('stores only the widest audience role', async () => {
    const created = documentation({ id: 'new-id', audienceRoles: ['public'] });
    vi.mocked(dbDocumentationCreate).mockResolvedValueOnce(created);

    await createDocumentation({
      ...created,
      id: null,
      audienceRoles: ['admin', 'user', 'public'],
    });

    expect(dbDocumentationCreate).toHaveBeenCalledWith(expect.objectContaining({ audienceRoles: ['public'] }));
  });
});
