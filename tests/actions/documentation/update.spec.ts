import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/documentation/documentation.update', () => ({
  dbDocumentationUpdate: vi.fn(),
}));

vi.mock('@/storage/documentation/documentation.get-by-short-link', () => ({
  dbDocumentationGetByShortLink: vi.fn(),
}));

vi.mock('@/actions/documentation/embed', () => ({
  embedDocumentationById: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    exception: vi.fn(),
  },
}));

import { DocumentationShortLinkTakenError } from '@/actions/documentation/documentation-short-link-taken.error';
import { updateDocumentation } from '@/actions/documentation/update';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { dbDocumentationGetByShortLink } from '@/storage/documentation/documentation.get-by-short-link';
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

  it('stores a normalized short link on a public article', async () => {
    const updated = documentation({ isPublic: true, shortLink: 'boete' });
    vi.mocked(dbDocumentationGetByShortLink).mockResolvedValueOnce(null);
    vi.mocked(dbDocumentationUpdate).mockResolvedValueOnce(updated);
    vi.mocked(embedDocumentationById).mockResolvedValueOnce();

    await updateDocumentation({ ...updated, shortLink: ' Boete ' });

    expect(dbDocumentationUpdate).toHaveBeenCalledWith(expect.objectContaining({ shortLink: 'boete' }));
  });

  it('keeps the short link when the article is not public', async () => {
    const updated = documentation({ isPublic: false, shortLink: 'boete' });
    vi.mocked(dbDocumentationGetByShortLink).mockResolvedValueOnce(null);
    vi.mocked(dbDocumentationUpdate).mockResolvedValueOnce(updated);
    vi.mocked(embedDocumentationById).mockResolvedValueOnce();

    await updateDocumentation({ ...updated, shortLink: 'boete' });

    expect(dbDocumentationGetByShortLink).toHaveBeenCalledWith('boete');
    expect(dbDocumentationUpdate).toHaveBeenCalledWith(expect.objectContaining({ shortLink: 'boete' }));
  });

  it('rejects a short link already used by another article', async () => {
    const updated = documentation({ isPublic: true, shortLink: 'boete' });
    vi.mocked(dbDocumentationGetByShortLink).mockResolvedValueOnce(
      documentation({ id: '550e8400-e29b-41d4-a716-446655440099', shortLink: 'boete' }),
    );

    await expect(updateDocumentation(updated)).rejects.toBeInstanceOf(DocumentationShortLinkTakenError);
    expect(dbDocumentationUpdate).not.toHaveBeenCalled();
  });
});
