'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { DocumentationGroup } from '@/domain/documentation-group.model';
import type { Page } from '@/domain/page.model';
import { Skeleton } from '@/app/components/ui/skeleton';

import { FaqGroupBlock } from './faq-group-block';

export function FaqGroupsList() {
  const t = useTranslations('faq');
  const locale = useLocale();
  const [state, setState] = useState<{ groups: DocumentationGroup[]; loading: boolean; error: boolean }>({
    groups: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    params.set('take', '50');
    params.set('skip', '0');
    params.set('sortBy', 'sortOrder');
    params.set('sortOrder', 'asc');
    void fetch(`/api/documentation-groups?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((data: Page<DocumentationGroup>) => {
        if (!cancelled) {
          setState({ groups: data.records, loading: false, error: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ groups: [], loading: false, error: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (state.loading) {
    return (
      <div className="mt-16">
        <Skeleton className="mb-6 h-8 w-56" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (state.error) {
    return <p className="text-muted-foreground mt-16 text-sm">{t('errorLoad')}</p>;
  }

  if (state.groups.length === 0) {
    return <p className="text-muted-foreground mt-16 text-sm">{t('emptyFaq')}</p>;
  }

  return (
    <div className="mt-16">
      <h2 className="mb-2 text-lg font-bold text-[#181510]">{t('faqHeading')}</h2>
      {state.groups
        .filter((g): g is DocumentationGroup & { id: string } => Boolean(g.id))
        .map((g) => (
          <FaqGroupBlock key={g.id} groupId={g.id} groupName={g.name} />
        ))}
    </div>
  );
}
