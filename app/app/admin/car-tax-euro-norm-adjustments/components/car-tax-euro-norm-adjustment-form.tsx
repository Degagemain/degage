'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';

export const CAR_TAX_EURO_NORM_ADJUSTMENT_FORM_ID = 'car-tax-euro-norm-adjustment-editor-form';

interface CarTaxEuroNormAdjustmentFormProps {
  initial?: CarTaxEuroNormAdjustment;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (row: CarTaxEuroNormAdjustment) => Promise<void>;
}

interface FormValues {
  fiscalRegionId: string;
  fiscalRegionName: string;
  euroNormGroup: string;
  defaultAdjustment: string;
  dieselAdjustment: string;
}

const getInitialState = (row?: CarTaxEuroNormAdjustment): FormValues => ({
  fiscalRegionId: row?.fiscalRegion.id ?? '',
  fiscalRegionName: row?.fiscalRegion.name ?? '',
  euroNormGroup: row != null ? String(row.euroNormGroup) : '0',
  defaultAdjustment: row != null ? String(row.defaultAdjustment) : '0',
  dieselAdjustment: row != null ? String(row.dieselAdjustment) : '0',
});

const createSchema = (tCommon: (key: string) => string) =>
  z.object({
    fiscalRegionId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    fiscalRegionName: z.string(),
    euroNormGroup: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    defaultAdjustment: z.string().trim().min(1, tCommon('validation.required')),
    dieselAdjustment: z.string().trim().min(1, tCommon('validation.required')),
  });

export function CarTaxEuroNormAdjustmentForm({
  initial,
  formId = CAR_TAX_EURO_NORM_ADJUSTMENT_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: CarTaxEuroNormAdjustmentFormProps) {
  const t = useTranslations('admin.carTaxEuroNormAdjustments');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initial), [initial]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CarTaxEuroNormAdjustment = {
      id: initial?.id ?? null,
      fiscalRegion: {
        id: values.fiscalRegionId,
        name: values.fiscalRegionName.trim() || values.fiscalRegionId,
      },
      euroNormGroup: Number(values.euroNormGroup),
      defaultAdjustment: Number(values.defaultAdjustment),
      dieselAdjustment: Number(values.dieselAdjustment),
      createdAt: initial?.createdAt ?? null,
      updatedAt: initial?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="fiscalRegionId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.fiscalRegion')}
              value={field.value}
              selectedLabel={form.watch('fiscalRegionName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('fiscalRegionName', option.name, { shouldValidate: true });
              }}
              apiPath="fiscal-regions"
              placeholder={t('form.placeholders.fiscalRegion')}
              description={t('form.help.fiscalRegion')}
              error={fieldState.error?.message}
              disabled={isSubmitting || Boolean(initial?.id)}
            />
          )}
        />
        <Controller
          name="euroNormGroup"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.euroNormGroup')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.euroNormGroup')}
              error={fieldState.error?.message}
              disabled={isSubmitting || Boolean(initial?.id)}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="defaultAdjustment"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.defaultAdjustment')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.defaultAdjustment')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              step={0.01}
            />
          )}
        />
        <Controller
          name="dieselAdjustment"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.dieselAdjustment')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.dieselAdjustment')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              step={0.01}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
