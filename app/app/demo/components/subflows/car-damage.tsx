'use client';

import { useOnboarding } from '../../lib/onboarding-context';
import { SubflowActions } from '../subflow-actions';
import { DemoBtn, DemoField, DemoPanel } from '../demo-ui';
import styles from '../../demo.module.css';

export function CarDamageSubflow() {
  const { state, updateSubflow } = useOnboarding();
  const data = state['car-damage'];

  const addPhoto = () => {
    const label = `Schadefoto ${data.photos.length + 1}`;
    updateSubflow('car-damage', { photos: [...data.photos, label] });
  };

  const removePhoto = (index: number) => {
    updateSubflow('car-damage', { photos: data.photos.filter((_, i) => i !== index) });
  };

  return (
    <>
      <DemoPanel title="Bestaande schade" body="Upload foto's van krassen, deuken of andere schade.">
        <DemoField label="Foto's">
          {data.photos.length > 0 ? (
            <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
              {data.photos.map((photo, i) => (
                <li key={photo} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span>{photo}</span>
                  <DemoBtn variant="secondary" small onClick={() => removePhoto(i)}>
                    Verwijderen
                  </DemoBtn>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.fieldHint}>Nog geen foto&apos;s geüpload.</p>
          )}
          <DemoBtn variant="secondary" onClick={addPhoto}>
            Foto toevoegen (simulatie)
          </DemoBtn>
        </DemoField>
      </DemoPanel>

      <SubflowActions subflowId="car-damage" />
    </>
  );
}
