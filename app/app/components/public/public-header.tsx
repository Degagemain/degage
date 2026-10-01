'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
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

  const navItems = [
    { href: '/app/simulation', label: t('header.nav.simulation'), match: '/app/simulation' },
    { href: '/app/faq', label: t('header.nav.faq'), match: '/app/faq' },
  ];

  return (
    <>
      <header className={cn(styles.publicTheme, styles.headerBar, 'fixed inset-x-0 top-0 z-50', scrolled && styles.headerScrolled)}>
        <div className="mx-auto flex h-14 max-w-6xl items-stretch justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-stretch gap-6 lg:gap-10">
            <Link href="/app" className="inline-flex shrink-0 items-center py-0.5" aria-label={t('brand')}>
              <Image src="/landing/logo.png" alt="" width={160} height={53} className="h-7 w-auto sm:h-8" priority />
            </Link>

            <nav className="hidden items-stretch sm:flex" aria-label={t('header.nav.label')}>
              {navItems.map((item) => {
                const active = pathname?.startsWith(item.match);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(styles.navLink, 'mr-5 last:mr-0 lg:mr-7', active && styles.navLinkActive)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher triggerClassName={styles.langTrigger} showLabel />

            {showLoadingUi ? (
              <Skeleton className="h-9 w-28 rounded-full" />
            ) : showAuthenticatedUi && session ? (
              <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} size="sm" />
            ) : showGuestUi ? (
              <Button type="button" size="sm" className={cn(styles.primaryCta, 'h-9 rounded-full px-4')} onClick={() => setLoginOpen(true)}>
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
