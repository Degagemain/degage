import { getTranslations } from 'next-intl/server';

import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import { PublicPage } from '@/app/components/public/public-shell';
import type { DocumentationFormat } from '@/domain/documentation.model';

import { FaqBackToHelpLink } from './faq-back-to-help-link';

export async function FaqArticleUnavailable() {
  const t = await getTranslations('faq');

  return (
    <PublicPage>
      <FaqBackToHelpLink />
      <p className="text-muted-foreground text-sm">{t('errorLoad')}</p>
    </PublicPage>
  );
}

export async function FaqArticleDetail({ title, content, format }: { title: string; content: string; format: DocumentationFormat }) {
  return (
    <PublicPage>
      <FaqBackToHelpLink />
      <article>
        <h1 className="text-foreground mb-6 text-[28px] font-extrabold tracking-tight">{title}</h1>
        <div className="documentation-body">
          {format === 'markdown' ? (
            <DocumentationMarkdown markdown={content} />
          ) : (
            <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{content}</pre>
          )}
        </div>
      </article>
    </PublicPage>
  );
}
