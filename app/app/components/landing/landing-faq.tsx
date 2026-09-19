'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import { LANDING_FAQ_TAG } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import styles from '@/app/components/public/public-theme.module.css';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/app/lib/utils';

function pickTranslation(doc: Documentation, locale: string) {
  const byLocale = doc.translations.find((t) => t.locale === locale);
  const byDefault = doc.translations.find((t) => t.locale === defaultContentLocale);
  return byLocale ?? byDefault ?? doc.translations[0];
}

export function LandingFaq() {
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
    params.set('isFaq', 'true');
    params.append('tags', LANDING_FAQ_TAG);
    params.set('sortBy', 'externalId');
    params.set('sortOrder', 'asc');
    params.set('take', '50');
    params.set('skip', '0');
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
      <div className="mt-6 space-y-3" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (state.error || state.items.length === 0) {
    return null;
  }

  const firstValue = state.items[0]?.id ?? state.items[0]?.externalId ?? undefined;

  return (
    <Accordion type="single" collapsible defaultValue={firstValue} className="mt-6">
      {state.items.map((doc) => {
        const tr = pickTranslation(doc, contentLocale);
        if (!tr) return null;
        const value = doc.id ?? doc.externalId;
        const body =
          doc.format === 'markdown' ? <DocumentationMarkdown markdown={tr.content} /> : <p className="m-0 whitespace-pre-wrap">{tr.content}</p>;
        return (
          <AccordionItem key={value} value={value} className="border-[var(--public-image-border)]">
            <AccordionTrigger className={cn('py-3 text-base font-medium hover:no-underline', styles.textHeading)}>{tr.title}</AccordionTrigger>
            <AccordionContent className={cn('text-sm leading-relaxed', styles.textMuted)}>{body}</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
