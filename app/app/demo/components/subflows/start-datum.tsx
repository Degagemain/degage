'use client';

import { useMemo } from 'react';

import { useSubflowDraft } from '../../lib/use-subflow-draft';
import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoField, DemoPanel, DemoSelect } from '../demo-ui';
import styles from '../../demo.module.css';

const MONTHS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maart' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Augustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function earliestShareDate(insuranceStart: string): Date | null {
  if (!insuranceStart) return null;
  const d = new Date(insuranceStart);
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(1);
  return d;
}

export function StartDatumSubflow() {
  const { variant, state } = useOnboarding();
  const { draft, patchDraft, save } = useSubflowDraft('start-datum');
  const insurance = state['insurance-info'];
  const isBuyingCar = variant === 'new-car';

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(now + i));
  }, []);

  const earliest = isBuyingCar ? null : earliestShareDate(insurance.startDate);
  const selectedDate = draft.month && draft.year ? new Date(Number(draft.year), Number(draft.month) - 1, 1) : null;
  const tooEarly = earliest && selectedDate && selectedDate < earliest;

  return (
    <>
      {isBuyingCar ? (
        <div className={styles.bannerInfo}>
          Kies de maand waarin je wagen na levering beschikbaar wordt. Je start altijd op de eerste van de maand.
        </div>
      ) : null}

      {earliest ? (
        <div className={styles.bannerInfo}>
          Op basis van je verzekering is de vroegste startdatum{' '}
          <strong>{earliest.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })}</strong> (eerste van de maand).
        </div>
      ) : null}

      <DemoPanel title="Startdatum delen" body="Kies de maand waarin je wagen beschikbaar wordt.">
        <div className={styles.tileGrid}>
          <DemoField label="Maand">
            <DemoSelect value={draft.month} onChange={(e) => patchDraft({ month: e.target.value })}>
              <option value="">Kies maand</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </DemoSelect>
          </DemoField>
          <DemoField label="Jaar">
            <DemoSelect value={draft.year} onChange={(e) => patchDraft({ year: e.target.value })}>
              <option value="">Kies jaar</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </DemoSelect>
          </DemoField>
        </div>
      </DemoPanel>

      {tooEarly ? <div className={styles.bannerWarning}>Deze datum valt vóór je verzekering toelaat. Kies een latere maand.</div> : null}

      {selectedDate && !tooEarly ? (
        <div className={styles.bannerSuccess}>
          Je start met delen op <strong>{selectedDate.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
        </div>
      ) : null}

      <SubflowActions subflowId="start-datum" onSave={save} />
    </>
  );
}
