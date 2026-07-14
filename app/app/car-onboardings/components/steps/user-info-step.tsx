'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInput, PublicPanel } from '../public-ui';
import { PublicSearchableField } from '../public-searchable-field';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';

export function UserInfoStep() {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const { carOnboarding, reload } = useCarOnboarding();
  const [street, setStreet] = useState(carOnboarding.street ?? '');
  const [townId, setTownId] = useState(carOnboarding.town?.id ?? '');
  const [townName, setTownName] = useState(carOnboarding.town?.name ?? '');
  const [phone, setPhone] = useState(carOnboarding.phone ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStreet(carOnboarding.street ?? '');
    setTownId(carOnboarding.town?.id ?? '');
    setTownName(carOnboarding.town?.name ?? '');
    setPhone(carOnboarding.phone ?? '');
  }, [carOnboarding]);

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id || !townId) return false;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/user-info`, {
        street: street.trim() || null,
        town: { id: townId, name: townName },
        phone: phone.trim() || null,
      });
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('errors.save')));
        return false;
      }
      toast.success(t('saveSuccess'));
      await reload();
      return true;
    } catch {
      toast.error(t('errors.save'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StepLayout stepId="user-info">
      <PublicPanel title={t('steps.userInfo.panelTitle')}>
        <PublicField label={tAdmin('columns.street')}>
          <PublicInput value={street} onChange={(e) => setStreet(e.target.value)} />
        </PublicField>
        <PublicSearchableField
          label={tAdmin('columns.town')}
          value={townId}
          selectedLabel={townName || undefined}
          onValueChange={(id, option) => {
            setTownId(id);
            setTownName(option.name);
          }}
          apiPath="towns"
          labelKey="displayLabel"
          placeholder={tAdmin('form.placeholders.town')}
        />
        <PublicField label={tAdmin('columns.phone')}>
          <PublicInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </PublicField>
      </PublicPanel>
      <StepActions stepId="user-info" onSave={handleSave} saveDisabled={isSaving || !townId} />
    </StepLayout>
  );
}
