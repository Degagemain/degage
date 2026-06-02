'use client';

import { useTranslations } from 'next-intl';

import { PublicPage } from '@/app/components/public/public-shell';

import { FaqArticleHero } from './components/faq-article-hero';
import { FaqGroupsList } from './components/faq-groups-list';
import { FaqSearch } from './components/faq-search';

export default function FaqHubPage() {
  const t = useTranslations('faq');

  return (
    <PublicPage>
      <h1 className="text-foreground mb-2 text-[28px] leading-tight font-extrabold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground max-w-2xl text-[15px] leading-relaxed">{t('intro')}</p>
      <div className="mt-8 w-full">
        <FaqSearch />
      </div>
      <FaqArticleHero />
      <FaqGroupsList />
    </PublicPage>
  );
}
