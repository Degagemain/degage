'use client';

import { useMemo } from 'react';

import { useOnboarding } from '../../lib/onboarding-context';
import { useSubflowDraft } from '../../lib/use-subflow-draft';
import { SubflowActions } from '../subflow-actions';
import { DemoField, DemoInput, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

const MAX_MILEAGE = 250_000;

function estimateValue(mileage: number): number {
  const base = 28_000;
  const depreciationPerKm = 0.06;
  return Math.max(3_000, base - mileage * depreciationPerKm);
}

function DepreciationChart({ currentMileage }: { currentMileage: number }) {
  const points = useMemo(() => {
    const start = Math.max(0, currentMileage);
    const step = (MAX_MILEAGE - start) / 20;
    return Array.from({ length: 21 }, (_, i) => {
      const km = start + step * i;
      return { km, value: estimateValue(km) };
    });
  }, [currentMileage]);

  const minVal = estimateValue(MAX_MILEAGE);
  const maxVal = estimateValue(currentMileage);
  const pad = 24;
  const w = 600;
  const h = 180;

  const toX = (km: number) => pad + ((km - currentMileage) / (MAX_MILEAGE - currentMileage)) * (w - pad * 2);
  const toY = (val: number) => pad + ((maxVal - val) / (maxVal - minVal || 1)) * (h - pad * 2);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.km)} ${toY(p.value)}`).join(' ');

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" aria-label="Grafiek waardevermindering wagen">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#ddd6cb" strokeWidth="1" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#ddd6cb" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="#388e3c" strokeWidth="2.5" />
        <text x={pad} y={h - 6} fontSize="11" fill="#9c9489">
          {currentMileage.toLocaleString('nl-BE')} km
        </text>
        <text x={w - pad - 40} y={h - 6} fontSize="11" fill="#9c9489">
          250k km
        </text>
        <text x={6} y={pad + 4} fontSize="11" fill="#9c9489">
          €{Math.round(maxVal).toLocaleString('nl-BE')}
        </text>
        <text x={6} y={h - pad} fontSize="11" fill="#9c9489">
          €{Math.round(minVal).toLocaleString('nl-BE')}
        </text>
      </svg>
    </div>
  );
}

export function InstapwaardeSubflow() {
  const { state } = useOnboarding();
  const { draft, patchDraft, save } = useSubflowDraft('instapwaarde');
  const mileage = Number(state['car-info'].mileage) || 45_000;
  const valuePerKm = ((estimateValue(mileage) - estimateValue(mileage + 1000)) / 1000).toFixed(3);

  return (
    <>
      <DemoPanel
        title="Waardevermindering per gedeelde km"
        body={`Op basis van ${mileage.toLocaleString('nl-BE')} km is de instapwaarde ongeveer €${valuePerKm} per gedeelde kilometer.`}
      >
        <DepreciationChart currentMileage={mileage} />
      </DemoPanel>

      <DemoPanel title="Ga je akkoord met deze waarde?">
        <div className={styles.tileGrid}>
          <button
            type="button"
            className={`${styles.tile} ${draft.agreed === true ? styles.tileSelected : ''}`}
            onClick={() => patchDraft({ agreed: true })}
          >
            <div className={styles.tileTitle}>Ja, akkoord</div>
          </button>
          <button
            type="button"
            className={`${styles.tile} ${draft.agreed === false ? styles.tileSelected : ''}`}
            onClick={() => patchDraft({ agreed: false })}
          >
            <div className={styles.tileTitle}>Nee, tegenvoorstel</div>
          </button>
        </div>
      </DemoPanel>

      {draft.agreed === false ? (
        <DemoPanel title="Jouw voorstel">
          <DemoField label="Voorgestelde waarde (€/km)">
            <DemoInput value={draft.proposalValue} onChange={(e) => patchDraft({ proposalValue: e.target.value })} />
          </DemoField>
          <DemoField label="Toelichting">
            <DemoInput value={draft.proposalMessage} onChange={(e) => patchDraft({ proposalMessage: e.target.value })} />
          </DemoField>
        </DemoPanel>
      ) : null}

      {draft.agreed === true ? <div className={styles.bannerSuccess}>Je bent akkoord met de instapwaarde.</div> : null}

      <SubflowActions subflowId="instapwaarde" onSave={save} />
    </>
  );
}
