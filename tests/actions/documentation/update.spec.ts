import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.update', () => ({
  dbDocumentationUpdate: vi.fn(),
}));

vi.mock('@/actions/documentation/embed', () => ({
  embedDocumentationById: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    exception: vi.fn(),
  },
}));

import { updateDocumentation } from '@/actions/documentation/update';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { dbDocumentationUpdate } from '@/storage/documentation/documentation.update';
import { logger } from '@/lib/logger';
import { documentation } from '../../builders/documentation.builder';

describe('updateDocumentation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists a validated document and embeds it', async () => {
    const updated = documentation();
    vi.mocked(dbDocumentationUpdate).mockResolvedValueOnce(updated);
    vi.mocked(embedDocumentationById).mockResolvedValueOnce();

    const result = await updateDocumentation(updated);

    expect(result).toEqual(updated);
    expect(dbDocumentationUpdate).toHaveBeenCalledTimes(1);
    expect(embedDocumentationById).toHaveBeenCalledWith(updated.id);
  });

  it('stores only the widest audience role', async () => {
    const updated = documentation({ audienceRoles: ['user'] });
    vi.mocked(dbDocumentationUpdate).mockResolvedValueOnce(updated);
    vi.mocked(embedDocumentationById).mockResolvedValueOnce();

    await updateDocumentation({
      ...updated,
      audienceRoles: ['admin', 'user'],
    });

    expect(dbDocumentationUpdate).toHaveBeenCalledWith(expect.objectContaining({ audienceRoles: ['user'] }));
  });

  it('returns the saved document when embedding fails', async () => {
    const updated = documentation();
    vi.mocked(dbDocumentationUpdate).mockResolvedValueOnce(updated);
    vi.mocked(embedDocumentationById).mockRejectedValueOnce(new Error('gemini down'));

    const result = await updateDocumentation(updated);

    expect(result).toEqual(updated);
    expect(logger.exception).toHaveBeenCalled();
  });
});
