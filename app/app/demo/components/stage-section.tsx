'use client';

import { STAGE_LABELS, getSubflowsForStage } from '../lib/subflows-config';
import { useOnboarding } from '../lib/onboarding-context';
import type { OnboardingStage } from '../lib/types';
import { SubflowCard } from './subflow-card';
import styles from '../demo.module.css';

export function StageSection({ stage }: { stage: OnboardingStage }) {
  const { variant, currentStage } = useOnboarding();
  const subflows = getSubflowsForStage(variant, stage);
  const isCurrent = currentStage === stage;
  const isFuture =
    (stage === 'in_progress' && currentStage === 'preparation') || (stage === 'ready_to_share' && currentStage !== 'ready_to_share');

  return (
    <section className={styles.stageSection}>
      <div className={styles.stageHeader}>
        <h2 className={styles.sectionTitle}>{STAGE_LABELS[stage]}</h2>
        {isCurrent ? <span className={styles.stageIndicator}>Huidige fase</span> : null}
        {isFuture ? <span className={styles.stageIndicator}>Nog vergrendeld</span> : null}
      </div>
      <div className={styles.stageCards}>
        {subflows.map((s, index) => (
          <SubflowCard key={s.id} definition={s} stepNumber={index + 1} isLast={index === subflows.length - 1} />
        ))}
      </div>
    </section>
  );
}
