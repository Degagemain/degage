'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import type { DocumentationGroup } from '@/domain/documentation-group.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { PublicBrandPageWide } from '@/app/components/public-brand-shell';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';

import { FaqAccordionItem } from '../../components/faq-accordion-item';
import { pickDocumentationTranslation } from '../../faq-utils';

const PAGE_SIZE = 24;

export default function FaqGroupPage() {
  const params = useParams();
  const groupId = typeof params.groupId === 'string' ? params.groupId : '';
  const t = useTranslations('faq');
  const uiLocale = useLocale();
  const contentLocale = useMemo(() => {
    const l = uiLocales.includes(uiLocale as UILocale) ? (uiLocale as UILocale) : undefined;
    return l ? getContentLocale(l) : defaultContentLocale;
  }, [uiLocale]);

  const [groupName, setGroupName] = useState<string | null>(null);
  const [items, setItems] = useState<Documentation[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!groupId) {
      return;
    }
    let cancelled = false;
    const p = new URLSearchParams();
    p.set('take', '100');
    p.set('skip', '0');
    p.set('sortBy', 'sortOrder');
    p.set('sortOrder', 'asc');
    void fetch(`/api/documentation-groups?${p.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((data: Page<DocumentationGroup>) => {
        if (cancelled) {
          return;
        }
        const g = data.records.find((x) => x.id === groupId);
        setGroupName(g?.name ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setGroupName(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [groupId, uiLocale]);

  const load = useCallback(
    async (from: number, append: boolean) => {
      if (!groupId) {
        return;
      }
      setLoading(true);
      setError(false);
      const params = new URLSearchParams();
      params.set('isPublic', 'true');
      params.set('isFaq', 'true');
      params.set('group', groupId);
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
    },
    [groupId, uiLocale],
  );

  useEffect(() => {
    if (groupId) {
      void load(0, false);
    }
  }, [groupId, load]);

  const hasMore = items.length < total;
  const title = groupName ?? t('allFaqInGroupTitle');

  return (
    <PublicBrandPageWide>
      <Link href="/app/faq" className="text-muted-foreground mb-6 inline-block text-sm hover:text-[#181510]">
        {t('backToHelp')}
      </Link>
      <h1 className="mb-8 text-[28px] font-extrabold tracking-tight text-[#181510]">{title}</h1>

      {error && <p className="text-muted-foreground text-sm">{t('errorLoad')}</p>}

      {!error && !loading && items.length === 0 && <p className="text-muted-foreground text-sm">{t('emptyFaq')}</p>}

      <div className="overflow-hidden rounded-xl border border-[#DDD6CB] bg-white">
        {items.map((doc) => {
          const tr = pickDocumentationTranslation(doc, contentLocale);
          if (!tr) {
            return null;
          }
          return <FaqAccordionItem key={doc.id ?? doc.externalId} title={tr.title} markdown={tr.content} />;
        })}
      </div>

      {loading && items.length === 0 && (
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
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
