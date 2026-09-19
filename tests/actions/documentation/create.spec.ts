import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.create', () => ({
  dbDocumentationCreate: vi.fn(),
}));

vi.mock('@/actions/documentation/embed', () => ({
  embedDocumentationById: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    exception: vi.fn(),
  },
}));

import { createDocumentation } from '@/actions/documentation/create';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { dbDocumentationCreate } from '@/storage/documentation/documentation.create';
import { logger } from '@/lib/logger';
import { documentation } from '../../builders/documentation.builder';

describe('createDocumentation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a validated document and embeds it', async () => {
    const created = documentation({ id: 'new-id' });
    vi.mocked(dbDocumentationCreate).mockResolvedValueOnce(created);
    vi.mocked(embedDocumentationById).mockResolvedValueOnce();

    const result = await createDocumentation({ ...created, id: null });

    expect(result.id).toBe('new-id');
    expect(dbDocumentationCreate).toHaveBeenCalledTimes(1);
    expect(embedDocumentationById).toHaveBeenCalledWith('new-id');
  });

  it('stores only the widest audience role', async () => {
    const created = documentation({ id: 'new-id', audienceRoles: ['public'] });
    vi.mocked(dbDocumentationCreate).mockResolvedValueOnce(created);
    vi.mocked(embedDocumentationById).mockResolvedValueOnce();

    await createDocumentation({
      ...created,
      id: null,
      audienceRoles: ['admin', 'user', 'public'],
    });

    expect(dbDocumentationCreate).toHaveBeenCalledWith(expect.objectContaining({ audienceRoles: ['public'] }));
  });

  it('returns the saved document when embedding fails', async () => {
    const created = documentation({ id: 'new-id' });
    vi.mocked(dbDocumentationCreate).mockResolvedValueOnce(created);
    vi.mocked(embedDocumentationById).mockRejectedValueOnce(new Error('gemini down'));

    const result = await createDocumentation({ ...created, id: null });

    expect(result.id).toBe('new-id');
    expect(logger.exception).toHaveBeenCalled();
  });
});
