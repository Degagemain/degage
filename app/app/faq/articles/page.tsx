'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { PublicBrandPageWide } from '@/app/components/public-brand-shell';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';

import { excerptFromMarkdown, pickDocumentationTranslation } from '../faq-utils';

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
    <PublicBrandPageWide>
      <Link href="/app/faq" className="text-muted-foreground mb-6 inline-block text-sm hover:text-[#181510]">
        {t('backToHelp')}
      </Link>
      <h1 className="mb-8 text-[28px] font-extrabold tracking-tight text-[#181510]">{t('allArticlesTitle')}</h1>

      {error && <p className="text-muted-foreground text-sm">{t('errorLoad')}</p>}

      {!error && items.length === 0 && !loading && <p className="text-muted-foreground text-sm">{t('emptyArticles')}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((doc) => {
          const tr = pickDocumentationTranslation(doc, contentLocale);
          if (!tr) {
            return null;
          }
          return (
            <Card key={doc.id ?? doc.externalId} className="gap-0 overflow-hidden rounded-xl border-[#DDD6CB] bg-white py-0 shadow-none">
              <CardContent className="px-5 py-4">
                <h2 className="mb-2 text-base font-semibold text-[#181510]">{tr.title}</h2>
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

      {loading && items.length === 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      )}

      {hasMore && !loading && items.length > 0 && (
        <div className="mt-10 flex justify-center">
          <Button type="button" variant="outline" className="border-[#DDD6CB]" onClick={() => void load(skip, true)}>
            {t('loadMore')}
          </Button>
        </div>
      )}
    </PublicBrandPageWide>
  );
}
