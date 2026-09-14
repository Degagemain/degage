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

vi.mock('@/app/faq/faq-features', () => ({
  isFaqArticlesEnabled: vi.fn(),
}));

import FaqHubPage from '@/app/faq/page';
import { isFaqArticlesEnabled } from '@/app/faq/faq-features';

describe('FaqHubPage articles section', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('hides the articles section when the flag is off', () => {
    vi.mocked(isFaqArticlesEnabled).mockReturnValue(false);
    render(<FaqHubPage />);

    expect(screen.queryByTestId('faq-articles')).toBeNull();
    expect(screen.getByTestId('faq-groups')).toBeTruthy();
  });

  it('shows the articles section when the flag is on', () => {
    vi.mocked(isFaqArticlesEnabled).mockReturnValue(true);
    render(<FaqHubPage />);

    expect(screen.getByTestId('faq-articles')).toBeTruthy();
    expect(screen.getByTestId('faq-groups')).toBeTruthy();
  });
});
