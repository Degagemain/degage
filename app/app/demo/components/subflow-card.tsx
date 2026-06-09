'use client';

import Link from 'next/link';

import { computeSubflowState } from '../lib/compute-stage';
import { useOnboarding } from '../lib/onboarding-context';
import type { SubflowDefinition } from '../lib/subflows-config';
import { StateIcon } from './demo-ui';
import styles from '../demo.module.css';

type SubflowCardProps = {
  definition: SubflowDefinition;
  stepNumber: number;
  isLast: boolean;
};

export function SubflowCard({ definition, stepNumber, isLast }: SubflowCardProps) {
  const { variant, state, currentStage } = useOnboarding();
  const subflowState = computeSubflowState(definition.id, state, variant, currentStage);
  const disabled = subflowState === 'blocked';
  const href = `/app/demo/car-onboarding/${variant}/${definition.id}`;
  const showStatus = definition.tracksStatus && !disabled;

  const content = (
    <div className={styles.subflowCardInner}>
      <div className={styles.subflowCardTrack}>
        <span className={styles.subflowCardStep}>{stepNumber}</span>
        {!isLast ? <span className={styles.subflowCardConnector} aria-hidden /> : null}
      </div>
      <div className={styles.subflowCardBody}>
        <h3 className={styles.subflowCardTitle}>
          {definition.title}
          {showStatus ? <StateIcon state={subflowState} /> : null}
        </h3>
        <p className={styles.subflowCardSubtitle}>{definition.subtitle}</p>
      </div>
    </div>
  );

  if (disabled) {
    return <div className={`${styles.subflowCard} ${styles.subflowCardDisabled}`}>{content}</div>;
  }

  return (
    <Link href={href} className={styles.subflowCard}>
      {content}
    </Link>
  );
}
