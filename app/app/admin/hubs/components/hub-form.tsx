'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Hub } from '@/domain/hub.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';

export const HUB_FORM_ID = 'hub-editor-form';

interface HubFormProps {
  initialHub?: Hub;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (hub: Hub) => Promise<void>;
}

type HubFormValues = {
  name: string;
  isDefault: boolean;
  simMaxAge: string;
  simMaxKm: string;
  simMinEuroNormGroupDiesel: string;
  simMinEcoScoreForBonus: string;
  simMaxKmForBonus: string;
  simMaxAgeForBonus: string;
  simDepreciationKm: string;
  simDepreciationKmElectric: string;
  simInspectionCostPerYear: string;
  simMaintenanceCostPerYear: string;
  simMaxPrice: string;
  simAcceptedPriceCategoryA: string;
  simAcceptedPriceCategoryB: string;
  simAcceptedDepreciationCostKm: string;
  simAcceptedElectricDepreciationCostKm: string;
};

type HubNumericFormFieldKey = Exclude<keyof HubFormValues, 'name' | 'isDefault'>;

const hubToFormValues = (hub?: Hub): HubFormValues => ({
  name: hub?.name ?? '',
  isDefault: hub?.isDefault ?? false,
  simMaxAge: hub != null ? String(hub.simMaxAge) : '15',
  simMaxKm: hub != null ? String(hub.simMaxKm) : '200000',
  simMinEuroNormGroupDiesel: hub != null ? String(hub.simMinEuroNormGroupDiesel) : '5',
  simMinEcoScoreForBonus: hub != null ? String(hub.simMinEcoScoreForBonus) : '65',
  simMaxKmForBonus: hub != null ? String(hub.simMaxKmForBonus) : '140000',
  simMaxAgeForBonus: hub != null ? String(hub.simMaxAgeForBonus) : '7',
  simDepreciationKm: hub != null ? String(hub.simDepreciationKm) : '250000',
  simDepreciationKmElectric: hub != null ? String(hub.simDepreciationKmElectric) : '320000',
  simInspectionCostPerYear: hub != null ? String(hub.simInspectionCostPerYear) : '43',
  simMaintenanceCostPerYear: hub != null ? String(hub.simMaintenanceCostPerYear) : '950',
  simMaxPrice: hub?.simMaxPrice != null ? String(hub.simMaxPrice) : '',
  simAcceptedPriceCategoryA: hub != null ? String(hub.simAcceptedPriceCategoryA) : '0.38',
  simAcceptedPriceCategoryB: hub != null ? String(hub.simAcceptedPriceCategoryB) : '0.46',
  simAcceptedDepreciationCostKm: hub != null ? String(hub.simAcceptedDepreciationCostKm) : '0.32',
  simAcceptedElectricDepreciationCostKm: hub != null ? String(hub.simAcceptedElectricDepreciationCostKm) : '0.33',
});

const nonNegInt = (msg: string) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, msg);

const nonNegNum = (msg: string) =>
  z
    .string()
    .trim()
    .min(1, msg)
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, msg);

const createHubFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, tCommon('validation.required')).max(100),
    isDefault: z.boolean(),
    simMaxAge: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simMaxKm: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simMinEuroNormGroupDiesel: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simMinEcoScoreForBonus: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simMaxKmForBonus: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simMaxAgeForBonus: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simDepreciationKm: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simDepreciationKmElectric: nonNegInt(tCommon('validation.nonNegativeInteger')),
    simInspectionCostPerYear: nonNegNum(tCommon('validation.nonNegativeNumber')),
    simMaintenanceCostPerYear: nonNegNum(tCommon('validation.nonNegativeNumber')),
    simMaxPrice: z
      .string()
      .trim()
      .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) > 0), tCommon('validation.optionalPositiveInteger')),
    simAcceptedPriceCategoryA: nonNegNum(tCommon('validation.nonNegativeNumber')),
    simAcceptedPriceCategoryB: nonNegNum(tCommon('validation.nonNegativeNumber')),
    simAcceptedDepreciationCostKm: nonNegNum(tCommon('validation.nonNegativeNumber')),
    simAcceptedElectricDepreciationCostKm: nonNegNum(tCommon('validation.nonNegativeNumber')),
  });

export function HubForm({ initialHub, formId = HUB_FORM_ID, isSubmitting = false, onSubmit }: HubFormProps) {
  const t = useTranslations('admin.hubs');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createHubFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => hubToFormValues(initialHub), [initialHub]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<HubFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const simMaxPriceTrim = values.simMaxPrice.trim();
    const payload: Hub = {
      id: initialHub?.id ?? null,
      name: values.name.trim(),
      isDefault: values.isDefault,
      simMaxAge: Number(values.simMaxAge),
      simMaxKm: Number(values.simMaxKm),
      simMinEuroNormGroupDiesel: Number(values.simMinEuroNormGroupDiesel),
      simMinEcoScoreForBonus: Number(values.simMinEcoScoreForBonus),
      simMaxKmForBonus: Number(values.simMaxKmForBonus),
      simMaxAgeForBonus: Number(values.simMaxAgeForBonus),
      simDepreciationKm: Number(values.simDepreciationKm),
      simDepreciationKmElectric: Number(values.simDepreciationKmElectric),
      simInspectionCostPerYear: Number(values.simInspectionCostPerYear),
      simMaintenanceCostPerYear: Number(values.simMaintenanceCostPerYear),
      simMaxPrice: simMaxPriceTrim ? Number(simMaxPriceTrim) : null,
      simAcceptedPriceCategoryA: Number(values.simAcceptedPriceCategoryA),
      simAcceptedPriceCategoryB: Number(values.simAcceptedPriceCategoryB),
      simAcceptedDepreciationCostKm: Number(values.simAcceptedDepreciationCostKm),
      simAcceptedElectricDepreciationCostKm: Number(values.simAcceptedElectricDepreciationCostKm),
      createdAt: initialHub?.createdAt ?? null,
      updatedAt: initialHub?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  const num = (name: HubNumericFormFieldKey, colKey: string, step?: number) => (
    <Controller
      key={name}
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <AdminNumberFieldControl
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- column keys match messages admin.hubs.columns.*
          label={t(`columns.${colKey}` as any)}
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          disabled={isSubmitting}
          min={0}
          step={step}
        />
      )}
    />
  );

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextFieldControl
              label={t('columns.name')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.name')}
              description={t('form.help.name')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="isDefault"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="hub-is-default"
              label={t('columns.default')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.default')}
              disabled={isSubmitting}
            />
          )}
        />
        {num('simMaxAge', 'simMaxAge', 1)}
        {num('simMaxKm', 'simMaxKm', 1)}
        {num('simMinEuroNormGroupDiesel', 'simMinEuroNormGroupDiesel', 1)}
        {num('simMinEcoScoreForBonus', 'simMinEcoScoreForBonus', 1)}
        {num('simMaxKmForBonus', 'simMaxKmForBonus', 1)}
        {num('simMaxAgeForBonus', 'simMaxAgeForBonus', 1)}
        {num('simDepreciationKm', 'simDepreciationKm', 1)}
        {num('simDepreciationKmElectric', 'simDepreciationKmElectric', 1)}
        {num('simInspectionCostPerYear', 'simInspectionCostPerYear', 0.01)}
        {num('simMaintenanceCostPerYear', 'simMaintenanceCostPerYear', 0.01)}
        <Controller
          name="simMaxPrice"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.simMaxPrice')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.simMaxPrice')}
              description={t('form.help.simMaxPrice')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
        {num('simAcceptedPriceCategoryA', 'simAcceptedPriceCategoryA', 0.01)}
        {num('simAcceptedPriceCategoryB', 'simAcceptedPriceCategoryB', 0.01)}
        {num('simAcceptedDepreciationCostKm', 'simAcceptedDepreciationCostKm', 0.01)}
        {num('simAcceptedElectricDepreciationCostKm', 'simAcceptedElectricDepreciationCostKm', 0.01)}
      </FieldGroup>
    </form>
  );
}
