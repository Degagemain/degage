'use client';

import { renderInlineCopyRich } from '@/app/components/inline-copy';
import { useTranslations } from 'next-intl';

import { NEW_REGION_START_DOC_HREF } from '../simulation-public.constants';
import styles from '../simulation.module.css';

type Props = {
  town: string;
};

export function NewRegionWarning({ town }: Props) {
  const t = useTranslations('simulationPublic');

  return (
    <div className={`${styles.amberBanner} ${styles.amberBannerSpaced}`} role="note">
      <p className={styles.amberBannerText}>
        {renderInlineCopyRich(
          t.rich('newRegionWarning', {
            town,
            link: (chunks) => (
              <a href={NEW_REGION_START_DOC_HREF} target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
                {chunks}
              </a>
            ),
          }),
        )}
      </p>
    </div>
  );
}
