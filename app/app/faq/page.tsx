'use client';

import { useTranslations } from 'next-intl';

import { PublicBrandPageWide } from '@/app/components/public-brand-shell';

import { FaqArticleHero } from './components/faq-article-hero';
import { FaqGroupsList } from './components/faq-groups-list';
import { FaqSearch } from './components/faq-search';

export default function FaqHubPage() {
  const t = useTranslations('faq');

  return (
    <PublicBrandPageWide>
      <h1 className="mb-2 text-[28px] leading-tight font-extrabold tracking-tight text-[#181510]">{t('title')}</h1>
      <p className="text-muted-foreground max-w-2xl text-[15px] leading-relaxed">{t('intro')}</p>
      <div className="mt-8 w-full">
        <FaqSearch />
      </div>
      <FaqArticleHero />
      <FaqGroupsList />
    </PublicBrandPageWide>
  );
}
