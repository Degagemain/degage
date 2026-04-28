'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { PublicBrandPageWide } from '@/app/components/public-brand-shell';
import { Skeleton } from '@/app/components/ui/skeleton';

type ViewerPayload = {
  externalId: string;
  format: 'markdown' | 'text';
  title: string;
  content: string;
};

export default function FaqArticleDetailPage() {
  const params = useParams();
  const raw = typeof params.externalId === 'string' ? params.externalId : '';
  const externalId = raw ? decodeURIComponent(raw) : '';
  const t = useTranslations('faq');

  const [state, setState] = useState<{ doc: ViewerPayload | null; loading: boolean; error: 'not_found' | 'forbidden' | 'network' | null }>({
    doc: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!externalId) {
      setState({ doc: null, loading: false, error: 'not_found' });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    void fetch(
      `/api/documentation/by-external-id/${encodeURIComponent(externalId)}?${new URLSearchParams({ publicCatalog: 'true' }).toString()}`,
    )
      .then(async (res) => {
        if (cancelled) {
          return;
        }
        if (res.status === 404) {
          setState({ doc: null, loading: false, error: 'not_found' });
          return;
        }
        if (res.status === 403) {
          setState({ doc: null, loading: false, error: 'forbidden' });
          return;
        }
        if (!res.ok) {
          setState({ doc: null, loading: false, error: 'network' });
          return;
        }
        const doc = (await res.json()) as ViewerPayload;
        setState({ doc, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ doc: null, loading: false, error: 'network' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [externalId]);

  if (state.loading) {
    return (
      <PublicBrandPageWide>
        <Skeleton className="mb-6 h-6 w-32" />
        <Skeleton className="mb-4 h-10 w-full max-w-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </PublicBrandPageWide>
    );
  }

  if (state.error || !state.doc) {
    return (
      <PublicBrandPageWide>
        <Link href="/app/faq" className="text-muted-foreground mb-6 inline-block text-sm hover:text-[#181510]">
          {t('backToHelp')}
        </Link>
        <p className="text-muted-foreground text-sm">{t('errorLoad')}</p>
      </PublicBrandPageWide>
    );
  }

  const doc = state.doc;

  return (
    <PublicBrandPageWide>
      <Link href="/app/faq" className="text-muted-foreground mb-6 inline-block text-sm hover:text-[#181510]">
        {t('backToHelp')}
      </Link>
      <article>
        <h1 className="mb-6 text-[28px] font-extrabold tracking-tight text-[#181510]">{doc.title}</h1>
        <div className="documentation-body">
          {doc.format === 'markdown' ? (
            <DocumentationMarkdown markdown={doc.content} />
          ) : (
            <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{doc.content}</pre>
          )}
        </div>
      </article>
    </PublicBrandPageWide>
  );
}
