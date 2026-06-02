'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { Documentation } from '@/domain/documentation.model';
import { Card, CardContent } from '@/app/components/ui/card';
import { cn } from '@/app/lib/utils';

import { excerptFromMarkdown } from '../faq-utils';
import styles from '../faq.module.css';

type Props = {
  doc: Documentation;
  title: string;
  content: string;
  titleAs?: 'h2' | 'h3';
};

export function FaqArticleCard({ doc, title, content, titleAs: TitleTag = 'h3' }: Props) {
  const t = useTranslations('faq');
  const href = `/app/faq/articles/${encodeURIComponent(doc.externalId)}`;

  return (
    <Link href={href} className={styles.articleCardLink}>
      <Card className={cn(styles.articleCard, 'border-border bg-card gap-0 overflow-hidden rounded-xl py-0 shadow-none')}>
        <CardContent className="p-5">
          <TitleTag className="text-foreground mb-2 text-base font-semibold">{title}</TitleTag>
          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{excerptFromMarkdown(content)}</p>
          <span className={styles.articleCardRead}>{t('readArticle')} →</span>
        </CardContent>
      </Card>
    </Link>
  );
}
