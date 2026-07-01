'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicPanel, PublicReadOnlyValue } from '../public-ui';
import { PublicSearchableField } from '../public-searchable-field';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';

const formatDate = (value: Date | string | null): string => {
  if (value == null) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
};

const formatBool = (value: boolean, t: (key: string) => string): string => (value ? t('yes') : t('no'));

export function CarInfoStep() {
  const t = useTranslations('carOnboardingPublic');
  const tShared = useTranslations('common');
  const tAdmin = useTranslations('admin.carOnboardings');
  const { carOnboarding, reload } = useCarOnboarding();
  const hasOtherCarType = Boolean(carOnboarding.carTypeOther?.trim()) && carOnboarding.carType == null;

  const [brandId, setBrandId] = useState(carOnboarding.brand?.id ?? '');
  const [brandName, setBrandName] = useState(carOnboarding.brand?.name ?? '');
  const [fuelTypeId, setFuelTypeId] = useState(carOnboarding.fuelType?.id ?? '');
  const [fuelTypeName, setFuelTypeName] = useState(carOnboarding.fuelType?.name ?? '');
  const [carTypeId, setCarTypeId] = useState(carOnboarding.carType?.id ?? '');
  const [carTypeName, setCarTypeName] = useState(carOnboarding.carType?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const carTypeQueryParams = useMemo(() => {
    if (!brandId || !fuelTypeId) return undefined;
    return { brandId, fuelTypeId };
  }, [brandId, fuelTypeId]);

  useEffect(() => {
    setBrandId(carOnboarding.brand?.id ?? '');
    setBrandName(carOnboarding.brand?.name ?? '');
    setFuelTypeId(carOnboarding.fuelType?.id ?? '');
    setFuelTypeName(carOnboarding.fuelType?.name ?? '');
    setCarTypeId(carOnboarding.carType?.id ?? '');
    setCarTypeName(carOnboarding.carType?.name ?? '');
  }, [carOnboarding]);

  const handleSave = async () => {
    if (!carOnboarding.id || !brandId || !fuelTypeId || !carTypeId || hasOtherCarType) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/car-info`, {
        brand: { id: brandId, name: brandName },
        fuelType: { id: fuelTypeId, name: fuelTypeName },
        carType: { id: carTypeId, name: carTypeName },
      });
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('errors.save')));
        return;
      }
      toast.success(t('saveSuccess'));
      await reload();
    } catch {
      toast.error(t('errors.save'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StepLayout stepId="car-info">
      <PublicPanel title={t('steps.carInfo.panelTitle')}>
        {hasOtherCarType ? (
          <PublicReadOnlyValue label={tAdmin('columns.carTypeOther')} value={carOnboarding.carTypeOther ?? ''} />
        ) : (
          <>
            <PublicSearchableField
              label={tAdmin('columns.brand')}
              value={brandId}
              selectedLabel={brandName || undefined}
              onValueChange={(id, option) => {
                setBrandId(id);
                setBrandName(option.name);
                setCarTypeId('');
                setCarTypeName('');
              }}
              apiPath="car-brands"
              placeholder={tAdmin('form.placeholders.brand')}
            />
            <PublicSearchableField
              label={tAdmin('columns.fuelType')}
              value={fuelTypeId}
              selectedLabel={fuelTypeName || undefined}
              onValueChange={(id, option) => {
                setFuelTypeId(id);
                setFuelTypeName(option.name);
                setCarTypeId('');
                setCarTypeName('');
              }}
              apiPath="fuel-types"
              placeholder={tAdmin('form.placeholders.fuelType')}
            />
            <PublicSearchableField
              label={tAdmin('columns.carType')}
              value={carTypeId}
              selectedLabel={carTypeName || undefined}
              onValueChange={(id, option) => {
                setCarTypeId(id);
                setCarTypeName(option.name);
              }}
              apiPath="car-types"
              queryParams={carTypeQueryParams}
              placeholder={brandId && fuelTypeId ? tAdmin('form.placeholders.carType') : tAdmin('form.placeholders.carTypeFirst')}
              disabled={!brandId || !fuelTypeId}
            />
          </>
        )}
      </PublicPanel>

      <PublicPanel title={t('steps.carInfo.readOnlyTitle')}>
        <PublicReadOnlyValue label={tAdmin('columns.mileage')} value={String(carOnboarding.mileage)} />
        <PublicReadOnlyValue label={tAdmin('columns.seats')} value={String(carOnboarding.seats)} />
        <PublicReadOnlyValue label={tAdmin('columns.firstRegisteredAt')} value={formatDate(carOnboarding.firstRegisteredAt)} />
        <PublicReadOnlyValue label={tAdmin('columns.isVan')} value={formatBool(carOnboarding.isVan, tShared)} />
        <PublicReadOnlyValue label={tAdmin('columns.isPurchased')} value={formatBool(carOnboarding.isPurchased, tShared)} />
        {carOnboarding.isPurchased ? (
          <>
            <PublicReadOnlyValue label={tAdmin('columns.isNewCar')} value={formatBool(carOnboarding.isNewCar, tShared)} />
            <PublicReadOnlyValue label={tAdmin('columns.purchasePrice')} value={String(carOnboarding.purchasePrice)} />
          </>
        ) : null}
      </PublicPanel>

      <StepActions
        stepId="car-info"
        onSave={() => void handleSave()}
        saveDisabled={isSaving || hasOtherCarType || !brandId || !fuelTypeId || !carTypeId}
        showSave={!hasOtherCarType}
      />
    </StepLayout>
  );
}
