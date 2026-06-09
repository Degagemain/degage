'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

export function InsuranceProgressSubflow() {
  const { state } = useOnboarding();
  const startDatum = state['start-datum'];
  const insuranceStart = startDatum.month && startDatum.year ? new Date(Number(startDatum.year), Number(startDatum.month) - 1, 1) : null;

  return (
    <>
      <DemoPanel title="Nieuwe verzekering">
        <p className={styles.panelBody}>
          Hier zie je de opstart van je verzekering voor gedeeld gebruik. Je hoeft niets te doen — we houden je op de hoogte.
        </p>
      </DemoPanel>

      <div className={styles.tileGrid}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Startdatum verzekering</h3>
          <p className={styles.panelBody} style={{ marginBottom: 0 }}>
            {insuranceStart
              ? insuranceStart.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Nog niet bekend — afhankelijk van je gekozen startdatum'}
          </p>
        </div>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Eerste factuur</h3>
          <p className={styles.panelBody} style={{ marginBottom: 0 }}>
            € 142,50 — verwacht binnen twee weken na de startdatum
          </p>
        </div>
      </div>

      <SubflowActions subflowId="insurance" />
    </>
  );
}
