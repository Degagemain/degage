'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

const TEMPLATES = [
  { id: 'gray' as const, label: 'Grijs', className: styles.stickerGray },
  { id: 'black' as const, label: 'Zwart', className: styles.stickerBlack },
  { id: 'white' as const, label: 'Wit', className: styles.stickerWhite },
];

export function StickersSubflow() {
  const { state, updateSubflow } = useOnboarding();
  const data = state.stickers;

  const lockIn = () => {
    if (!data.template) return;
    updateSubflow('stickers', { locked: true });
  };

  return (
    <>
      <DemoPanel title="Kies je stickerkleur" body="Kies een sjabloon dat goed zichtbaar is op je wagen.">
        <div className={styles.stickerGrid}>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={data.locked}
              className={`${styles.stickerOption} ${t.className} ${data.template === t.id ? styles.stickerSelected : ''}`}
              onClick={() => updateSubflow('stickers', { template: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </DemoPanel>

      {data.template && !data.locked ? (
        <div className={styles.actions}>
          <DemoBtn onClick={lockIn}>Keuze bevestigen →</DemoBtn>
        </div>
      ) : null}

      {data.locked ? (
        <div className={styles.bannerSuccess}>
          Stickers besteld in kleur: <strong>{data.template}</strong>
        </div>
      ) : null}

      <SubflowActions subflowId="stickers" />
    </>
  );
}
