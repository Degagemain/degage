'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { Input } from '@/app/components/ui/input';
import { cn } from '@/app/lib/utils';

import { pickDocumentationTranslation } from '../faq-utils';

export function FaqSearch({ className }: { className?: string }) {
  const t = useTranslations('faq');
  const uiLocale = useLocale();
  const contentLocale = useMemo(() => {
    const l = uiLocales.includes(uiLocale as UILocale) ? (uiLocale as UILocale) : undefined;
    return l ? getContentLocale(l) : defaultContentLocale;
  }, [uiLocale]);

  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Documentation[]>([]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (debounced.length < 2) {
      setRecords([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('isPublic', 'true');
    params.set('query', debounced);
    params.set('take', '12');
    params.set('skip', '0');
    void fetch(`/api/documentation?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('search failed'))))
      .then((data: Page<Documentation>) => {
        if (!cancelled) {
          setRecords(data.records);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecords([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className={cn('relative', className)}>
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t('searchPlaceholder')}
        className="h-12 rounded-lg border-[#DDD6CB] bg-white text-base"
        aria-autocomplete="list"
        aria-expanded={open && debounced.length >= 2}
        autoComplete="off"
      />
      {open && debounced.length >= 2 && (
        <div
          className="border-border absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-xl border bg-white py-1 shadow-md"
          role="listbox"
        >
          {loading && <p className="text-muted-foreground px-4 py-3 text-sm">{t('searchLoading')}</p>}
          {!loading && records.length === 0 && <p className="text-muted-foreground px-4 py-3 text-sm">{t('searchNoResults')}</p>}
          {!loading && records.length > 0 && (
            <p className="text-muted-foreground px-4 py-2 text-xs font-semibold tracking-wide uppercase">{t('searchResultsLabel')}</p>
          )}
          {records.map((doc) => {
            const tr = pickDocumentationTranslation(doc, contentLocale);
            if (!tr) {
              return null;
            }
            return (
              <Link
                key={doc.id ?? doc.externalId}
                href={`/app/faq/articles/${encodeURIComponent(doc.externalId)}`}
                className="hover:bg-muted/50 block px-4 py-2.5 text-sm"
                onClick={() => setOpen(false)}
                role="option"
              >
                {tr.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
