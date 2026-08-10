'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { isValidPhoneNumber } from '@/domain/phone.model';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInput, PublicPanel } from '../public-ui';
import { PublicSearchableField } from '../public-searchable-field';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

export function UserInfoStep() {
  const t = useTranslations('carOnboardingPublic');
  const tAdmin = useTranslations('admin.carOnboardings');
  const { carOnboarding, reload } = useCarOnboarding();
  const [street, setStreet] = useState(carOnboarding.street ?? '');
  const [houseNumber, setHouseNumber] = useState(carOnboarding.houseNumber ?? '');
  const [townId, setTownId] = useState(carOnboarding.town?.id ?? '');
  const [townName, setTownName] = useState(carOnboarding.town?.name ?? '');
  const [phone, setPhone] = useState(carOnboarding.phone ?? '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStreet(carOnboarding.street ?? '');
    setHouseNumber(carOnboarding.houseNumber ?? '');
    setTownId(carOnboarding.town?.id ?? '');
    setTownName(carOnboarding.town?.name ?? '');
    setPhone(carOnboarding.phone ?? '');
    setPhoneError(null);
  }, [carOnboarding]);

  const validatePhone = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setPhoneError(null);
      return true;
    }

    if (!isValidPhoneNumber(trimmed)) {
      setPhoneError(t('steps.userInfo.phoneInvalid'));
      return false;
    }

    setPhoneError(null);
    return true;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id || !townId) return false;
    if (!validatePhone(phone)) return false;

    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/user-info`, {
        street: street.trim() || null,
        houseNumber: houseNumber.trim() || null,
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
        <div className={styles.fieldRow}>
          <PublicField label={tAdmin('columns.street')}>
            <PublicInput value={street} onChange={(e) => setStreet(e.target.value)} />
          </PublicField>
          <PublicField label={tAdmin('columns.houseNumber')}>
            <PublicInput value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
          </PublicField>
        </div>
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
          <PublicInput
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError) setPhoneError(null);
            }}
            onBlur={() => validatePhone(phone)}
          />
          {phoneError ? <p className={styles.fieldError}>{phoneError}</p> : null}
        </PublicField>
      </PublicPanel>
      <StepActions stepId="user-info" onSave={handleSave} saveDisabled={isSaving || !townId} />
    </StepLayout>
  );
}
