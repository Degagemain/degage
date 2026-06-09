'use client';

import Link from 'next/link';

import { useSubflowReadOnly } from './subflow-read-only-context';
import { getSubflowDefinition } from '../lib/subflows-config';
import { getNextAccessibleSubflow } from '../lib/subflow-navigation';
import { useOnboarding } from '../lib/onboarding-context';
import type { SubflowId } from '../lib/types';
import { DemoBtn } from './demo-ui';
import styles from '../demo.module.css';

type SubflowActionsProps = {
  subflowId: SubflowId;
  onSave?: () => void;
  saveDisabled?: boolean;
};

export function SubflowActions({ subflowId, onSave, saveDisabled }: SubflowActionsProps) {
  const readOnly = useSubflowReadOnly();
  const { variant, state, currentStage } = useOnboarding();
  const definition = getSubflowDefinition(subflowId);
  const showSave = Boolean(definition?.hasInputs && onSave && !readOnly);
  const next = getNextAccessibleSubflow(variant, subflowId, state, currentStage);
  const nextHref = next ? `/app/demo/car-onboarding/${variant}/${next.id}` : null;

  if (!showSave && !nextHref) return null;

  return (
    <div className={styles.subflowActions}>
      {showSave && onSave ? (
        <DemoBtn onClick={onSave} disabled={saveDisabled}>
          Opslaan
        </DemoBtn>
      ) : null}
      {nextHref ? (
        <Link href={nextHref} className={`${styles.btn} ${styles.btnSecondary}`}>
          Volgende →
        </Link>
      ) : null}
    </div>
  );
}
