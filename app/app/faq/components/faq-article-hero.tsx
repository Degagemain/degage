'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { Skeleton } from '@/app/components/ui/skeleton';

import { FaqArticleCard } from './faq-article-card';
import { FaqSectionHeader } from './faq-section-header';
import { pickDocumentationTranslation } from '../faq-utils';
import styles from '../faq.module.css';

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
        <div className={styles.sectionHeader}>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-28" />
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
      <FaqSectionHeader title={t('articlesHeading')} moreHref="/app/faq/articles" moreLabel={t('articlesShowMore')} />
      <div className="grid gap-4 sm:grid-cols-2">
        {state.items.map((doc) => {
          const tr = pickDocumentationTranslation(doc, contentLocale);
          if (!tr) {
            return null;
          }
          return <FaqArticleCard key={doc.id ?? doc.externalId} doc={doc} title={tr.title} content={tr.content} />;
        })}
      </div>
    </section>
  );
}
