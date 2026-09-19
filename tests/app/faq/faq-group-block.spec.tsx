import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/app/components/documentation/documentation-markdown', () => ({
  DocumentationMarkdown: ({ markdown }: { markdown: string }) => <div>{markdown}</div>,
}));

import { FaqGroupBlock } from '@/app/faq/components/faq-group-block';

describe('FaqGroupBlock', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ records: [], total: 0 }),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('fetches FAQ items with the public_faq tag', async () => {
    const fetchMock = vi.mocked(fetch);
    render(<FaqGroupBlock groupId="group-1" groupName="Billing" />);

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const url = String(fetchMock.mock.calls[0]?.[0]);
    const params = new URL(url, 'http://localhost').searchParams;
    expect(url).toContain('/api/documentation?');
    expect(params.get('tags')).toBe('public_faq');
    expect(params.get('isFaq')).toBe('true');
    expect(params.get('isPublic')).toBe('true');
    expect(params.get('group')).toBe('group-1');
  });
});
