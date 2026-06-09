'use client';

import { useSubflowDraft } from '../../lib/use-subflow-draft';
import { SubflowActions } from '../subflow-actions';
import { DemoField, DemoInput, DemoPanel, DemoSelect } from '../demo-ui';
import styles from '../../demo.module.css';

const BELGIAN_INSURERS = ['AG Insurance', 'Ethias', 'AXA', 'Baloise', 'Vivium', 'KBC Verzekeringen', 'Allianz', 'DVV', 'Fidelia', 'Aedes'];

function addOneYear(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isLessThanOneYearAgo(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return d > oneYearAgo;
}

export function InsuranceInfoSubflow() {
  const { draft, patchDraft, save } = useSubflowDraft('insurance-info');
  const showWarning = draft.startDate && isLessThanOneYearAgo(draft.startDate);

  return (
    <>
      <DemoPanel title="Huidige verzekering">
        <DemoField label="Startdatum verzekering">
          <DemoInput type="date" value={draft.startDate} onChange={(e) => patchDraft({ startDate: e.target.value })} />
        </DemoField>
        <DemoField label="Verzekeraar">
          <DemoSelect value={draft.insurer} onChange={(e) => patchDraft({ insurer: e.target.value })}>
            <option value="">Kies verzekeraar</option>
            {BELGIAN_INSURERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </DemoSelect>
        </DemoField>
      </DemoPanel>

      {showWarning ? (
        <div className={styles.bannerWarning}>
          Je verzekering is minder dan een jaar geleden gestart. Op zijn vroegst kan je opzeggen op{' '}
          <strong>{addOneYear(draft.startDate)}</strong>.
        </div>
      ) : null}

      <SubflowActions subflowId="insurance-info" onSave={save} />
    </>
  );
}
