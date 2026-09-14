import { afterEach, describe, expect, it, vi } from 'vitest';

import { isFaqArticlesEnabled } from '@/app/faq/faq-features';

describe('isFaqArticlesEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is false by default', () => {
    vi.stubEnv('NEXT_PUBLIC_FAQ_ARTICLES_ENABLED', '');
    expect(isFaqArticlesEnabled()).toBe(false);
  });

  it('is false for any value other than true', () => {
    vi.stubEnv('NEXT_PUBLIC_FAQ_ARTICLES_ENABLED', 'false');
    expect(isFaqArticlesEnabled()).toBe(false);
  });

  it('is true when the env is true', () => {
    vi.stubEnv('NEXT_PUBLIC_FAQ_ARTICLES_ENABLED', 'true');
    expect(isFaqArticlesEnabled()).toBe(true);
  });
});
