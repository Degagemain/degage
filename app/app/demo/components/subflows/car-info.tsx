'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { useSubflowDraft } from '../../lib/use-subflow-draft';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoField, DemoInput, DemoPanel } from '../demo-ui';

export function CarInfoSubflow() {
  const { variant } = useOnboarding();
  const { draft, patchDraft, save } = useSubflowDraft('car-info');
  const isBuyingCar = variant === 'new-car';

  return (
    <>
      <DemoPanel title="Gegevens van je wagen">
        <DemoField label="Chassisnummer (VIN)">
          <DemoInput value={draft.vin} onChange={(e) => patchDraft({ vin: e.target.value })} />
        </DemoField>
        <DemoField label="Kilometerstand">
          <DemoInput type="number" value={draft.mileage} onChange={(e) => patchDraft({ mileage: e.target.value })} />
        </DemoField>
        <DemoField label="Merk">
          <DemoInput value={draft.brand} onChange={(e) => patchDraft({ brand: e.target.value })} />
        </DemoField>
        <DemoField label="Model">
          <DemoInput value={draft.model} onChange={(e) => patchDraft({ model: e.target.value })} />
        </DemoField>
        <DemoField label="Bouwjaar">
          <DemoInput value={draft.year} onChange={(e) => patchDraft({ year: e.target.value })} />
        </DemoField>
        <DemoField label="Documenten" hint="Inschrijvingsbewijs en keuringsattest.">
          <DemoBtn variant="secondary" onClick={() => patchDraft({ documentsUploaded: true })} disabled={draft.documentsUploaded}>
            {draft.documentsUploaded ? 'Documenten geüpload' : 'Documenten uploaden'}
          </DemoBtn>
        </DemoField>
      </DemoPanel>

      {isBuyingCar ? (
        <DemoPanel title="Roze formulier" body="Keuring voor verkoop — upload het roze formulier van de garage of keuringsinstantie.">
          <DemoField label="Roze formulier">
            <DemoBtn variant="secondary" onClick={() => patchDraft({ pinkFormUploaded: true })} disabled={draft.pinkFormUploaded}>
              {draft.pinkFormUploaded ? 'Roze formulier geüpload' : 'Roze formulier uploaden'}
            </DemoBtn>
          </DemoField>
        </DemoPanel>
      ) : null}

      <SubflowActions subflowId="car-info" onSave={save} />
    </>
  );
}
