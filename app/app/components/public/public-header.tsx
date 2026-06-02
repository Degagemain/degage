'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { authClient } from '@/app/lib/auth';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { UserMenu } from '@/app/components/user-menu';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { cn } from '@/app/lib/utils';

import { PublicLoginDialog } from './public-login-dialog';
import styles from './public-theme.module.css';

const SCROLL_THRESHOLD_PX = 8;

export function PublicHeader() {
  const t = useTranslations('landing');
  const tAuth = useTranslations('auth');
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showAuthenticatedUi = mounted && Boolean(session);
  const showGuestUi = mounted && !session;
  const showLoadingUi = !mounted || isPending;

  return (
    <>
      <header
        className={cn(
          styles.publicTheme,
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
          scrolled
            ? 'border-b border-stone-200/80 bg-[#fafaf9]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#fafaf9]/75'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
          <Link href="/app" className="inline-flex shrink-0 py-0.5" aria-label={t('brand')}>
            <Image src="/landing/logo.png" alt="" width={160} height={53} className="h-7 w-auto sm:h-8" priority />
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher triggerClassName="text-stone-600 hover:bg-stone-100/80 hover:text-stone-900" showLabel />

            {showLoadingUi ? (
              <Skeleton className="h-9 w-20 rounded-full" />
            ) : showAuthenticatedUi && session ? (
              <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} size="sm" />
            ) : showGuestUi ? (
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-[var(--public-brand)] px-4 text-white hover:bg-[var(--public-brand-hover)]"
                onClick={() => setLoginOpen(true)}
              >
                {tAuth('signIn')}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <PublicLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
