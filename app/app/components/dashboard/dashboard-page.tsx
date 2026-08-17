'use client';

import Link from 'next/link';
import { Car, CircleHelp, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { InlineCopy } from '@/app/components/inline-copy';
import { PublicPage } from '@/app/components/public/public-shell';
import { Button } from '@/app/components/ui/button';
import { useIsAdmin } from '@/app/lib/role';

type DashboardPageProps = {
  name: string;
};

const cardClassName =
  'flex h-full flex-col rounded-xl border border-stone-200/80 bg-white p-6 shadow-none dark:border-stone-700/80 dark:bg-stone-900';

const iconWellClassName =
  'flex size-10 shrink-0 items-center justify-center self-start rounded-lg bg-[var(--public-icon-bg)] text-[var(--public-accent-strong)]';

const iconClassName = 'size-5 shrink-0';

export function DashboardPage({ name }: DashboardPageProps) {
  const t = useTranslations('dashboard');
  const { isAdmin } = useIsAdmin();

  return (
    <PublicPage>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-stone-900 dark:text-stone-50">{t('title', { name })}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
        <InlineCopy>{t('intro')}</InlineCopy>
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article className={cardClassName}>
          <span className={iconWellClassName} aria-hidden>
            <Car className={iconClassName} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-50">{t('cards.simulation.title')}</h2>
          <p className="mt-2 flex-1 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
            <InlineCopy>{t('cards.simulation.description')}</InlineCopy>
          </p>
          <Button className="mt-6 h-11 rounded-lg bg-[var(--public-brand)] px-6 text-white hover:bg-[var(--public-brand-hover)]" asChild>
            <Link href="/app/simulation">{t('cards.simulation.cta')}</Link>
          </Button>
        </article>

        <article className={cardClassName}>
          <span className={iconWellClassName} aria-hidden>
            <CircleHelp className={iconClassName} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-50">{t('cards.faq.title')}</h2>
          <p className="mt-2 flex-1 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
            <InlineCopy>{t('cards.faq.description')}</InlineCopy>
          </p>
          <Button
            variant="outline"
            className="mt-6 h-11 rounded-lg border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
            asChild
          >
            <Link href="/app/faq">{t('cards.faq.cta')}</Link>
          </Button>
        </article>

        {isAdmin ? (
          <article className={cardClassName}>
            <span className={iconWellClassName} aria-hidden>
              <Shield className={iconClassName} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-50">{t('cards.admin.title')}</h2>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
              <InlineCopy>{t('cards.admin.description')}</InlineCopy>
            </p>
            <Button
              variant="outline"
              className="mt-6 h-11 rounded-lg border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
              asChild
            >
              <Link href="/app/admin">{t('cards.admin.cta')}</Link>
            </Button>
          </article>
        ) : null}
      </div>
    </PublicPage>
  );
}
