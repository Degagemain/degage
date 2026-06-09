'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

const INFO_SESSIONS = [
  { id: 's1', date: 'do 12 jun 2026, 19:30', location: 'Buurthuis Leuven', spots: 8 },
  { id: 's2', date: 'di 17 jun 2026, 19:30', location: 'Online (Zoom)', spots: 20 },
  { id: 's3', date: 'ma 23 jun 2026, 19:30', location: 'Buurthuis Gent', spots: 5 },
];

export function InfoSessionSubflow() {
  const { state, updateSubflow } = useOnboarding();
  const data = state['info-session'];
  const enrolled = INFO_SESSIONS.find((s) => s.id === data.enrolledSessionId);

  const enroll = (sessionId: string) => {
    updateSubflow('info-session', { enrolledSessionId: sessionId, sessionFinished: false });
  };

  const finishSession = () => {
    updateSubflow('info-session', { sessionFinished: true });
  };

  return (
    <>
      {enrolled ? (
        <div className={styles.bannerInfo}>
          <strong>Ingeschreven:</strong> {enrolled.date} — {enrolled.location}
        </div>
      ) : null}

      <DemoPanel title="Komende infosessies" body="Kies een moment dat jou past.">
        <div className={styles.sessionList}>
          {INFO_SESSIONS.map((session) => {
            const isEnrolled = data.enrolledSessionId === session.id;
            return (
              <div key={session.id} className={`${styles.sessionItem} ${isEnrolled ? styles.sessionItemEnrolled : ''}`}>
                <div>
                  <div className={styles.sectionTitle} style={{ fontSize: 15 }}>
                    {session.date}
                  </div>
                  <div className={styles.sessionMeta}>
                    {session.location} · nog {session.spots} plaatsen
                  </div>
                </div>
                {!isEnrolled && !data.enrolledSessionId ? (
                  <DemoBtn small onClick={() => enroll(session.id)}>
                    Inschrijven
                  </DemoBtn>
                ) : isEnrolled ? (
                  <span className={styles.stageIndicator}>Ingeschreven</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </DemoPanel>

      {data.enrolledSessionId && !data.sessionFinished ? (
        <div className={styles.actions}>
          <DemoBtn variant="secondary" onClick={finishSession}>
            Infosessie afgerond (simulatie)
          </DemoBtn>
        </div>
      ) : null}

      {data.sessionFinished ? <div className={styles.bannerSuccess}>Infosessie afgerond. Bedankt voor je deelname.</div> : null}

      <SubflowActions subflowId="info-session" />
    </>
  );
}
