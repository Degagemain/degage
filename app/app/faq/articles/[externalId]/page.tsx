'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { PublicPage } from '@/app/components/public/public-shell';
import { Skeleton } from '@/app/components/ui/skeleton';

import { FaqBackToHelpLink } from '../../components/faq-back-to-help-link';

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
      <PublicPage>
        <Skeleton className="mb-6 h-8 w-40 rounded-lg" />
        <Skeleton className="mb-4 h-10 w-full max-w-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </PublicPage>
    );
  }

  if (state.error || !state.doc) {
    return (
      <PublicPage>
        <FaqBackToHelpLink />
        <p className="text-muted-foreground text-sm">{t('errorLoad')}</p>
      </PublicPage>
    );
  }

  const doc = state.doc;

  return (
    <PublicPage>
      <FaqBackToHelpLink />
      <article>
        <h1 className="text-foreground mb-6 text-[28px] font-extrabold tracking-tight">{doc.title}</h1>
        <div className="documentation-body">
          {doc.format === 'markdown' ? (
            <DocumentationMarkdown markdown={doc.content} />
          ) : (
            <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{doc.content}</pre>
          )}
        </div>
      </article>
    </PublicPage>
  );
}
