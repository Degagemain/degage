'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import styles from '../faq.module.css';

export function FaqBackToHelpLink() {
  const t = useTranslations('faq');

  return (
    <Link href="/app/faq" className={styles.backButton}>
      <ArrowLeft className={styles.backButtonIcon} aria-hidden />
      {t('backToHelp')}
    </Link>
  );
}
