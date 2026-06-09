'use client';

import Link from 'next/link';

import { PublicPage } from '@/app/components/public/public-shell';

import { DemoBtn, DemoRoot } from '../../components/demo-ui';
import { StageSection } from '../../components/stage-section';
import { STAGE_LABELS, STAGE_ORDER, VARIANT_LABELS } from '../../lib/subflows-config';
import { useOnboarding } from '../../lib/onboarding-context';
import styles from '../../demo.module.css';

export default function CarOnboardingLandingPage() {
  const { variant, currentStage, resetState } = useOnboarding();

  return (
    <PublicPage narrow>
      <DemoRoot>
        <p className={styles.eyebrow}>Wagen-onboarding · {VARIANT_LABELS[variant].title}</p>
        <h1 className={styles.pageTitle}>Jouw onboarding</h1>
        <p className={styles.pageIntro}>
          Huidige fase: <strong>{STAGE_LABELS[currentStage]}</strong>. Doorloop de stappen van boven naar beneden.
        </p>

        {STAGE_ORDER.map((stage, index) => (
          <div key={stage}>
            <StageSection stage={stage} />
            {index < STAGE_ORDER.length - 1 ? <div className={styles.stageDivider} /> : null}
          </div>
        ))}

        <div className={styles.actions}>
          <DemoBtn variant="secondary" small onClick={resetState}>
            Demo resetten
          </DemoBtn>
          <Link href="/app/demo" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
            Terug naar demo&apos;s
          </Link>
        </div>
      </DemoRoot>
    </PublicPage>
  );
}
