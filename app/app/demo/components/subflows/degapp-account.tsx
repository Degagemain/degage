'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { useSubflowDraft } from '../../lib/use-subflow-draft';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoField, DemoInput, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

export function DegappAccountSubflow() {
  const { updateSubflow } = useOnboarding();
  const { draft, patchDraft, save } = useSubflowDraft('degapp-account');

  const connect = () => {
    if (!draft.email.trim() || !draft.password.trim()) return;
    updateSubflow('degapp-account', { ...draft, connected: true });
  };

  const create = () => {
    if (!draft.email.trim()) return;
    updateSubflow('degapp-account', { ...draft, connected: true });
  };

  return (
    <>
      <DemoPanel title="Heb je al een Degapp-account?" body="Kies wat op jou van toepassing is.">
        <div className={styles.tileGrid}>
          <button
            type="button"
            className={`${styles.tile} ${draft.hasAccount === true ? styles.tileSelected : ''}`}
            onClick={() => patchDraft({ hasAccount: true, connected: false })}
          >
            <div className={styles.tileTitle}>Ja, ik heb al een account</div>
          </button>
          <button
            type="button"
            className={`${styles.tile} ${draft.hasAccount === false ? styles.tileSelected : ''}`}
            onClick={() => patchDraft({ hasAccount: false, connected: false })}
          >
            <div className={styles.tileTitle}>Nee, account aanmaken</div>
          </button>
        </div>
      </DemoPanel>

      {draft.hasAccount === true ? (
        <DemoPanel title="Account koppelen">
          <DemoField label="E-mailadres">
            <DemoInput type="email" value={draft.email} onChange={(e) => patchDraft({ email: e.target.value })} />
          </DemoField>
          <DemoField label="Wachtwoord">
            <DemoInput type="password" value={draft.password} onChange={(e) => patchDraft({ password: e.target.value })} />
          </DemoField>
          <DemoBtn onClick={connect} disabled={!draft.email.trim() || !draft.password.trim()}>
            Koppelen →
          </DemoBtn>
        </DemoPanel>
      ) : null}

      {draft.hasAccount === false ? (
        <DemoPanel title="Account aanmaken">
          <DemoField label="E-mailadres" hint="Je ontvangt een bevestigingslink per mail.">
            <DemoInput type="email" value={draft.email} onChange={(e) => patchDraft({ email: e.target.value })} />
          </DemoField>
          <DemoBtn onClick={create} disabled={!draft.email.trim()}>
            Account aanmaken →
          </DemoBtn>
        </DemoPanel>
      ) : null}

      {draft.connected ? <div className={styles.bannerSuccess}>Je Degapp-account is gekoppeld.</div> : null}

      <SubflowActions subflowId="degapp-account" onSave={save} />
    </>
  );
}
