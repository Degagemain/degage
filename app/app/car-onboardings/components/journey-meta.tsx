'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/app/lib/utils';

import { CHAPTER_DEFINITIONS } from '../lib/chapters-config';
import styles from '../car-onboarding-public.module.css';

const accentClass = {
  green: styles.journeyMetaCardGreen,
  amber: styles.journeyMetaCardAmber,
  purple: styles.journeyMetaCardPurple,
} as const;

export function JourneyMeta() {
  const t = useTranslations('carOnboardingPublic');

  return (
    <div className={styles.journeyMeta}>
      {CHAPTER_DEFINITIONS.map((chapter) => (
        <div key={chapter.id} className={cn(styles.journeyMetaCard, accentClass[chapter.accent])}>
          <div className={styles.journeyMetaLabel}>
            {chapter.num} · {t(chapter.shortKey)}
          </div>
          <p className={styles.journeyMetaBody}>{t(chapter.metaBodyKey)}</p>
        </div>
      ))}
    </div>
  );
}
