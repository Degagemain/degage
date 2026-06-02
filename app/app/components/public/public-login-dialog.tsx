'use client';

import Link from 'next/link';
import { CarFront, ClipboardList, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { buildSignInUrlWithReturnPath } from '@/app/lib/sign-in-return-path';
import { trackLoginDialogOptionClicked } from '@/app/lib/posthog-events';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { cn } from '@/app/lib/utils';

import styles from './public-theme.module.css';

const DEGAPP_URL = 'https://degapp.be/';

type PublicLoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PublicLoginDialog({ open, onOpenChange }: PublicLoginDialogProps) {
  const t = useTranslations('landing.header.loginDialog');
  const onboardingSignInUrl = buildSignInUrlWithReturnPath('/app/dashboard');

  const optionClassName = cn(
    styles.publicTheme,
    'group flex w-full items-start gap-4 rounded-xl border p-4 text-left',
    'border-[var(--public-dialog-border)] bg-[var(--public-option-bg)]',
    'transition-colors hover:border-[var(--public-border)] hover:bg-[var(--public-surface)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--public-glow)/0.35)]',
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(styles.publicTheme, 'gap-0 border-[var(--public-dialog-border)] bg-[var(--public-dialog-bg)] p-0 sm:max-w-md')}
      >
        <DialogHeader className="border-b border-[var(--public-dialog-border)] px-6 py-5 text-left">
          <DialogTitle className={cn('text-xl font-semibold', styles.textHeading)}>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 p-6">
          <a
            href={DEGAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={optionClassName}
            onClick={() => {
              trackLoginDialogOptionClicked('degapp');
              onOpenChange(false);
            }}
          >
            <span className="inline-flex rounded-lg bg-[var(--public-icon-bg)] p-2.5 text-[var(--public-accent-strong)]">
              <CarFront className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className={cn('font-semibold', styles.textHeading)}>{t('degapp.title')}</span>
                <span className={cn(styles.badgeAccent, 'rounded-full px-2.5 py-0.5 text-xs')}>{t('degapp.badge')}</span>
              </span>
              <span className={cn('mt-1 block text-sm leading-relaxed', styles.textMuted)}>{t('degapp.description')}</span>
            </span>
            <ExternalLink
              className="mt-1 size-4 shrink-0 text-[var(--public-text-subtle)] transition-colors group-hover:text-[var(--public-accent)]"
              aria-hidden
            />
          </a>

          <Link
            href={onboardingSignInUrl}
            className={optionClassName}
            onClick={() => {
              trackLoginDialogOptionClicked('onboarding');
              onOpenChange(false);
            }}
          >
            <span className="inline-flex rounded-lg bg-[var(--public-option-icon-bg)] p-2.5 text-[var(--public-option-icon-fg)]">
              <ClipboardList className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('font-semibold', styles.textHeading)}>{t('onboarding.title')}</span>
              <span className={cn('mt-1 block text-sm leading-relaxed', styles.textMuted)}>{t('onboarding.description')}</span>
            </span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
