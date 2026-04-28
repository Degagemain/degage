'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { LanguageSwitcher } from '@/app/components/language-switcher';

import styles from './public-brand-shell.module.css';

export function PublicBrandShell({ children }: { children: React.ReactNode }) {
  return <div className={styles.root}>{children}</div>;
}

export function PublicBrandHeader({ homeHref = '/app/faq' }: { homeHref?: string }) {
  const t = useTranslations('faq');

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href={homeHref} className={styles.logoBox}>
          <div className={styles.logoIcon}>D!</div>
          <div>
            <div className={styles.logoTitle}>{t('header.logoTitle')}</div>
            <div className={styles.logoSub}>{t('header.logoSub')}</div>
          </div>
        </Link>
        <div className={styles.headerEnd}>
          <LanguageSwitcher triggerClassName={styles.headerLangTrigger} showLabel />
        </div>
      </div>
    </header>
  );
}

export function PublicBrandPageWide({ children }: { children: React.ReactNode }) {
  return <div className={styles.pageWide}>{children}</div>;
}
