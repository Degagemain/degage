'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { PublicPage } from '@/app/components/public/public-shell';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';

import { FaqArticleCard } from '../components/faq-article-card';
import { FaqBackToHelpLink } from '../components/faq-back-to-help-link';
import { pickDocumentationTranslation } from '../faq-utils';

const PAGE_SIZE = 24;

export default function FaqAllArticlesPage() {
  const t = useTranslations('faq');
  const uiLocale = useLocale();
  const contentLocale = useMemo(() => {
    const l = uiLocales.includes(uiLocale as UILocale) ? (uiLocale as UILocale) : undefined;
    return l ? getContentLocale(l) : defaultContentLocale;
  }, [uiLocale]);

  const [items, setItems] = useState<Documentation[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (from: number, append: boolean) => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    params.set('isPublic', 'true');
    params.set('isFaq', 'false');
    params.set('take', String(PAGE_SIZE));
    params.set('skip', String(from));
    params.set('sortBy', 'updatedAt');
    params.set('sortOrder', 'desc');
    try {
      const res = await fetch(`/api/documentation?${params.toString()}`);
      if (!res.ok) {
        throw new Error('failed');
      }
      const data: Page<Documentation> = await res.json();
      setTotal(data.total);
      setSkip(from + data.records.length);
      setItems((prev) => (append ? [...prev, ...data.records] : data.records));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0, false);
  }, [load]);

  const hasMore = items.length < total;

  return (
    <PublicPage>
      <FaqBackToHelpLink />
      <h1 className="text-foreground mb-8 text-[28px] font-extrabold tracking-tight">{t('allArticlesTitle')}</h1>

      {error && <p className="text-muted-foreground text-sm">{t('errorLoad')}</p>}

      {!error && items.length === 0 && !loading && <p className="text-muted-foreground text-sm">{t('emptyArticles')}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((doc) => {
          const tr = pickDocumentationTranslation(doc, contentLocale);
          if (!tr) {
            return null;
          }
          return <FaqArticleCard key={doc.id ?? doc.externalId} doc={doc} title={tr.title} content={tr.content} titleAs="h2" />;
        })}
      </div>

      {loading && items.length === 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      )}

      {hasMore && !loading && items.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Button type="button" variant="outline" onClick={() => void load(skip, true)}>
            {t('loadMore')}
          </Button>
        </div>
      )}
    </PublicPage>
  );
}
