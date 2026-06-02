'use client';

import Link from 'next/link';
import { CarFront, ClipboardList, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { buildSignInUrlWithReturnPath } from '@/app/lib/sign-in-return-path';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { cn } from '@/app/lib/utils';

import styles from './public-theme.module.css';

const DEGAPP_URL = 'https://degapp.be/';

type PublicLoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const optionClassName = cn(
  'group flex w-full items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 text-left',
  'transition-colors hover:border-[var(--public-border)] hover:bg-[var(--public-surface)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--public-glow)/0.35)]',
);

export function PublicLoginDialog({ open, onOpenChange }: PublicLoginDialogProps) {
  const t = useTranslations('landing.header.loginDialog');
  const onboardingSignInUrl = buildSignInUrlWithReturnPath('/app');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(styles.publicTheme, 'gap-0 border-stone-200 bg-[#fafaf9] p-0 sm:max-w-md')}>
        <DialogHeader className="border-b border-stone-200 px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold text-stone-900">{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 p-6">
          <a href={DEGAPP_URL} target="_blank" rel="noopener noreferrer" className={optionClassName} onClick={() => onOpenChange(false)}>
            <span className="inline-flex rounded-lg bg-[var(--public-icon-bg)] p-2.5 text-[var(--public-accent-strong)]">
              <CarFront className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-stone-900">{t('degapp.title')}</span>
                <span className={cn(styles.badgeAccent, 'rounded-full px-2.5 py-0.5 text-xs')}>{t('degapp.badge')}</span>
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-stone-600">{t('degapp.description')}</span>
            </span>
            <ExternalLink
              className="mt-1 size-4 shrink-0 text-stone-400 transition-colors group-hover:text-[var(--public-accent)]"
              aria-hidden
            />
          </a>

          <Link href={onboardingSignInUrl} className={cn(optionClassName)} onClick={() => onOpenChange(false)}>
            <span className="inline-flex rounded-lg bg-stone-100 p-2.5 text-stone-700">
              <ClipboardList className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-semibold text-stone-900">{t('onboarding.title')}</span>
              <span className="mt-1 block text-sm leading-relaxed text-stone-600">{t('onboarding.description')}</span>
            </span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
