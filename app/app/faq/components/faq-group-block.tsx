'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import type { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { Skeleton } from '@/app/components/ui/skeleton';

import { FaqAccordionItem } from './faq-accordion-item';
import { FaqSectionHeader } from './faq-section-header';
import { pickDocumentationTranslation } from '../faq-utils';
import styles from '../faq.module.css';

type Props = {
  groupId: string;
  groupName: string;
};

export function FaqGroupBlock({ groupId, groupName }: Props) {
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
    params.set('isFaq', 'true');
    params.set('group', groupId);
    params.set('take', '5');
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
  }, [groupId]);

  if (state.loading) {
    return (
      <div className="mt-8">
        <div className={styles.sectionHeader}>
          <Skeleton className="h-7 w-2/3 max-w-md" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (state.error) {
    return null;
  }

  if (state.items.length === 0) {
    return null;
  }

  return (
    <section className="mt-10" aria-labelledby={`faq-group-${groupId}`}>
      <FaqSectionHeader
        titleId={`faq-group-${groupId}`}
        title={groupName}
        moreHref={`/app/faq/groups/${groupId}`}
        moreLabel={t('groupShowMoreCta', { name: groupName })}
      />
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        {state.items.map((doc) => {
          const tr = pickDocumentationTranslation(doc, contentLocale);
          if (!tr) {
            return null;
          }
          return <FaqAccordionItem key={doc.id ?? doc.externalId} title={tr.title} markdown={tr.content} />;
        })}
      </div>
    </section>
  );
}
