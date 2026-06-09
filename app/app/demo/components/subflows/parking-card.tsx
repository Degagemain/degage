'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

export function ParkingCardSubflow() {
  const { state, updateSubflow } = useOnboarding();
  const data = state['parking-card'];

  return (
    <>
      <DemoPanel title="Parkeerkaart">
        <p className={styles.panelBody}>Je aanvraag wordt verwerkt door de gemeente. Je kunt hier alleen de status opvolgen.</p>
        {data.manuallyDone ? (
          <div className={styles.bannerSuccess}>Parkeerkaart ontvangen.</div>
        ) : (
          <div className={styles.bannerInfo}>Status: in behandeling</div>
        )}
      </DemoPanel>

      {!data.manuallyDone ? (
        <div className={styles.actions}>
          <DemoBtn variant="secondary" onClick={() => updateSubflow('parking-card', { manuallyDone: true })}>
            Afgerond (simulatie)
          </DemoBtn>
        </div>
      ) : null}

      <SubflowActions subflowId="parking-card" />
    </>
  );
}
