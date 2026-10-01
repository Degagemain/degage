'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useSupportChat } from '@/app/components/support-chat-provider';
import { cn } from '@/app/lib/utils';

import { publicContainer, publicFooterPad } from './public-layout';
import styles from './public-theme.module.css';

export function PublicFooter() {
  const t = useTranslations('landing');
  const tChat = useTranslations('chat');
  const { openChat } = useSupportChat();

  return (
    <footer className={cn(styles.publicTheme, styles.siteFooter, publicFooterPad)}>
      <div className={cn(publicContainer, 'flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center')}>
        <p className={cn('text-lg font-extrabold tracking-tight', styles.textFooterStrong)}>{t('brand')}</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-semibold">
          <Link href="/app/faq" className="hover:text-white">
            {t('footer.faq')}
          </Link>
          <Link href="/app/simulation" className="hover:text-white">
            {t('header.nav.simulation')}
          </Link>
          <button type="button" className="hover:text-white" onClick={openChat}>
            {tChat('supportChat')}
          </button>
        </div>
      </div>
    </footer>
  );
}
