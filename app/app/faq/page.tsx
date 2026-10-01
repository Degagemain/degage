'use client';

import { useTranslations } from 'next-intl';

import { InlineCopy } from '@/app/components/inline-copy';
import { PublicPage } from '@/app/components/public/public-shell';
import styles from '@/app/components/public/public-theme.module.css';
import { cn } from '@/app/lib/utils';

import { FaqArticleHero } from './components/faq-article-hero';
import { FaqGroupsList } from './components/faq-groups-list';
import { FaqSearch } from './components/faq-search';
import { isFaqArticlesEnabled } from './faq-features';

export default function FaqHubPage() {
  const t = useTranslations('faq');
  const showArticles = isFaqArticlesEnabled();

  return (
    <PublicPage>
      <h1 className={styles.pageTitle}>{t('title')}</h1>
      <p className={cn('mt-3 max-w-2xl text-[16px] leading-relaxed', styles.textMuted)}>
        <InlineCopy>{t('intro')}</InlineCopy>
      </p>
      <div className="mt-8 w-full">
        <FaqSearch />
      </div>
      {showArticles && <FaqArticleHero />}
      <FaqGroupsList />
    </PublicPage>
  );
}
