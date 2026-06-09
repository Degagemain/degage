'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

export function ContractSubflow() {
  const { state, updateSubflow } = useOnboarding();
  const data = state.contract;

  const retrigger = () => {
    updateSubflow('contract', { sent: true });
  };

  const simulateSigned = () => {
    updateSubflow('contract', { signed: true });
  };

  return (
    <>
      <DemoPanel title="Contractstatus">
        <p className={styles.panelBody}>
          {data.signed
            ? 'Je contract is ondertekend.'
            : data.sent
              ? 'Het contract is verstuurd. Wacht op je handtekening.'
              : 'Het contract wordt automatisch verstuurd zodra alle voorbereidingen klaar zijn.'}
        </p>
        <div className={styles.actions} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <DemoBtn variant="secondary" onClick={retrigger}>
            Opnieuw versturen
          </DemoBtn>
          {data.sent && !data.signed ? <DemoBtn onClick={simulateSigned}>Ondertekend (simulatie)</DemoBtn> : null}
          {data.signed ? (
            <DemoBtn variant="secondary" onClick={() => window.open('#', '_blank')}>
              Contract bekijken
            </DemoBtn>
          ) : null}
        </div>
      </DemoPanel>

      <SubflowActions subflowId="contract" />
    </>
  );
}
