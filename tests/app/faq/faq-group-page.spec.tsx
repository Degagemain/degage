import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ groupId: 'group-1' }),
}));

vi.mock('@/app/components/public/public-shell', () => ({
  PublicPage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/app/components/documentation/documentation-markdown', () => ({
  DocumentationMarkdown: ({ markdown }: { markdown: string }) => <div>{markdown}</div>,
}));

import FaqGroupPage from '@/app/faq/groups/[groupId]/page';

describe('FaqGroupPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/api/documentation-groups')) {
          return {
            ok: true,
            json: async () => ({ records: [{ id: 'group-1', name: 'Billing' }], total: 1 }),
          };
        }
        return {
          ok: true,
          json: async () => ({ records: [], total: 0 }),
        };
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
    render(<FaqGroupPage />);

    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/api/documentation?'))).toBe(true);
    });

    const url = String(fetchMock.mock.calls.find(([input]) => String(input).includes('/api/documentation?'))?.[0]);
    const params = new URL(url, 'http://localhost').searchParams;
    expect(params.get('tags')).toBe('public_faq');
    expect(params.get('isFaq')).toBe('true');
    expect(params.get('isPublic')).toBe('true');
    expect(params.get('group')).toBe('group-1');
  });
});
