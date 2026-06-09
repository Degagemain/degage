'use client';

import { computeSubflowState } from '../lib/compute-stage';
import { isPreparationSubflowReadOnly } from '../lib/is-subflow-read-only';
import { getSubflowDefinition } from '../lib/subflows-config';
import { useOnboarding } from '../lib/onboarding-context';
import type { SubflowId } from '../lib/types';
import { DemoBackLink, DemoRoot, StateIcon, SubflowInfoBanner } from './demo-ui';
import { SubflowReadOnlyProvider } from './subflow-read-only-context';
import styles from '../demo.module.css';

export function SubflowLayout({ subflowId, children }: { subflowId: SubflowId; children: React.ReactNode }) {
  const { variant, state, currentStage } = useOnboarding();
  const definition = getSubflowDefinition(subflowId);
  const subflowState = computeSubflowState(subflowId, state, variant, currentStage);
  const readOnly = isPreparationSubflowReadOnly(subflowId, variant, currentStage);

  if (!definition) {
    return (
      <DemoRoot>
        <p>Stap niet gevonden.</p>
      </DemoRoot>
    );
  }

  if (subflowState === 'blocked') {
    return (
      <DemoRoot>
        <DemoBackLink href={`/app/demo/car-onboarding/${variant}`}>Terug naar overzicht</DemoBackLink>
        <h1 className={styles.pageTitle}>{definition.title}</h1>
        <SubflowInfoBanner>{definition.infoText}</SubflowInfoBanner>
        <p className={styles.pageIntro}>Deze stap is nog niet beschikbaar. Rond eerst de vorige stappen af.</p>
      </DemoRoot>
    );
  }

  return (
    <DemoRoot>
      <SubflowReadOnlyProvider readOnly={readOnly}>
        <DemoBackLink href={`/app/demo/car-onboarding/${variant}`}>Terug naar overzicht</DemoBackLink>
        <div className={styles.subflowTitleRow}>
          <h1 className={styles.pageTitle}>{definition.title}</h1>
          {definition.tracksStatus ? <StateIcon state={subflowState} inline /> : null}
        </div>
        <SubflowInfoBanner>{definition.infoText}</SubflowInfoBanner>
        {readOnly ? (
          <div className={styles.bannerInfo}>
            Deze stap is afgerond. Je onboarding is verder gevorderd — gegevens kunnen niet meer gewijzigd worden.
          </div>
        ) : null}
        <fieldset disabled={readOnly} className={styles.subflowFieldset}>
          {children}
        </fieldset>
      </SubflowReadOnlyProvider>
    </DemoRoot>
  );
}
