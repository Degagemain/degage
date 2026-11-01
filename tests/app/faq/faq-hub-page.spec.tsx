import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/components/inline-copy', () => ({
  InlineCopy: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/app/components/public/public-shell', () => ({
  PublicPage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/app/faq/components/faq-article-hero', () => ({
  FaqArticleHero: () => <div data-testid="faq-articles">articles</div>,
}));

vi.mock('@/app/faq/components/faq-groups-list', () => ({
  FaqGroupsList: () => <div data-testid="faq-groups">groups</div>,
}));

vi.mock('@/app/faq/components/faq-search', () => ({
  FaqSearch: () => <div data-testid="faq-search">search</div>,
}));

vi.mock('@/app/faq/use-faq-articles-enabled', () => ({
  useFaqArticlesEnabled: vi.fn(),
}));

import FaqHubPage from '@/app/faq/page';
import { useFaqArticlesEnabled } from '@/app/faq/use-faq-articles-enabled';

describe('FaqHubPage articles section', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('hides the articles section when the flag is off or loading', () => {
    vi.mocked(useFaqArticlesEnabled).mockReturnValue('disabled');
    const { rerender } = render(<FaqHubPage />);

    expect(screen.queryByTestId('faq-articles')).toBeNull();
    expect(screen.getByTestId('faq-groups')).toBeTruthy();

    vi.mocked(useFaqArticlesEnabled).mockReturnValue('loading');
    rerender(<FaqHubPage />);
    expect(screen.queryByTestId('faq-articles')).toBeNull();
  });

  it('shows the articles section when the flag is on', () => {
    vi.mocked(useFaqArticlesEnabled).mockReturnValue('enabled');
    render(<FaqHubPage />);

    expect(screen.getByTestId('faq-articles')).toBeTruthy();
    expect(screen.getByTestId('faq-groups')).toBeTruthy();
  });
});
