'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

export function SurveySubflow() {
  const { state, updateSubflow } = useOnboarding();
  const data = state.survey;

  const openSurvey = () => {
    window.open('https://forms.example.com/onboarding-enquete', '_blank', 'noopener,noreferrer');
    updateSubflow('survey', { opened: true });
  };

  return (
    <>
      <DemoPanel title="Enquête over je onboarding">
        <p className={styles.panelBody}>De vragenlijst duurt ongeveer drie minuten. Jouw feedback helpt ons het proces te verbeteren.</p>
        <DemoBtn onClick={openSurvey}>{data.opened ? 'Enquête opnieuw openen' : 'Enquête openen →'}</DemoBtn>
        {data.opened ? (
          <div className={styles.bannerSuccess} style={{ marginTop: 24 }}>
            Bedankt — de enquête is geopend.
          </div>
        ) : null}
      </DemoPanel>

      <SubflowActions subflowId="survey" />
    </>
  );
}
