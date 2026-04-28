'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { Card, CardContent } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';

import { FaqPromoCta } from './faq-promo-cta';
import { excerptFromMarkdown, pickDocumentationTranslation } from '../faq-utils';

export function FaqArticleHero() {
  const t = useTranslations('faq');
  const uiLocale = useLocale();
  const contentLocale = useMemo(() => {
    const l = uiLocales.includes(uiLocale as UILocale) ? (uiLocale as UILocale) : undefined;
    return l ? getContentLocale(l) : defaultContentLocale;
  }, [uiLocale]);

  const [state, setState] = useState<{ items: Documentation[]; loading: boolean; error: boolean }>({
    items: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.set('isPublic', 'true');
    params.set('isFaq', 'false');
    params.set('take', '6');
    params.set('skip', '0');
    params.set('sortBy', 'updatedAt');
    params.set('sortOrder', 'desc');
    void fetch(`/api/documentation?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((data: Page<Documentation>) => {
        if (!cancelled) {
          setState({ items: data.records, loading: false, error: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ items: [], loading: false, error: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <section className="mt-10">
        <div className="mb-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Skeleton className="h-11 w-56 rounded-md" />
        </div>
      </section>
    );
  }

  if (state.error) {
    return <p className="text-muted-foreground mt-10 text-sm">{t('errorLoad')}</p>;
  }

  if (state.items.length === 0) {
    return <p className="text-muted-foreground mt-10 text-sm">{t('emptyArticles')}</p>;
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-[#181510]">{t('articlesHeading')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {state.items.map((doc) => {
          const tr = pickDocumentationTranslation(doc, contentLocale);
          if (!tr) {
            return null;
          }
          return (
            <Card
              key={doc.id ?? doc.externalId}
              className="gap-0 overflow-hidden rounded-xl border-[#DDD6CB] bg-white py-0 shadow-none transition-shadow hover:shadow-sm"
            >
              <CardContent className="px-5 py-4">
                <h3 className="mb-2 text-base font-semibold text-[#181510]">{tr.title}</h3>
                <p className="text-muted-foreground mb-3 line-clamp-3 text-sm">{excerptFromMarkdown(tr.content)}</p>
                <Link
                  href={`/app/faq/articles/${encodeURIComponent(doc.externalId)}`}
                  className="text-sm font-medium text-[#1A3D2B] underline-offset-4 hover:underline"
                >
                  {t('readArticle')} →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <FaqPromoCta href="/app/faq/articles">{t('articlesShowMore')}</FaqPromoCta>
    </section>
  );
}
