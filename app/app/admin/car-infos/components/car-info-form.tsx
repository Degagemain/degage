'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { CarInfo } from '@/domain/car-info.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';

export const CAR_INFO_FORM_ID = 'car-info-editor-form';

const EURO_NORM_NONE = 'none';

interface CarInfoFormProps {
  initialCarInfo?: CarInfo;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (row: CarInfo) => Promise<void>;
}

interface FormValues {
  carTypeId: string;
  carTypeName: string;
  year: string;
  cylinderCc: string;
  co2Emission: string;
  ecoscore: string;
  euroNormId: string;
  euroNormName: string;
  consumption: string;
}

const getInitialState = (row?: CarInfo): FormValues => ({
  carTypeId: row?.carType.id ?? '',
  carTypeName: row?.carType.name ?? '',
  year: row != null ? String(row.year) : '',
  cylinderCc: row != null ? String(row.cylinderCc) : '',
  co2Emission: row != null ? String(row.co2Emission) : '',
  ecoscore: row != null ? String(row.ecoscore) : '',
  euroNormId: row?.euroNorm?.id ?? EURO_NORM_NONE,
  euroNormName: row?.euroNorm?.name ?? '',
  consumption: row != null ? String(row.consumption) : '',
});

const createSchema = (tCommon: (key: string) => string) =>
  z.object({
    carTypeId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    carTypeName: z.string(),
    year: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)), tCommon('validation.integer')),
    cylinderCc: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    co2Emission: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    ecoscore: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 0 && n <= 100;
      }, tCommon('validation.ecoscoreRange')),
    euroNormId: z.string(),
    euroNormName: z.string(),
    consumption: z.string().trim().min(1, tCommon('validation.required')),
  });

export function CarInfoForm({ initialCarInfo, formId = CAR_INFO_FORM_ID, isSubmitting = false, onSubmit }: CarInfoFormProps) {
  const t = useTranslations('admin.carInfos');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialCarInfo), [initialCarInfo]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);
  const isEdit = Boolean(initialCarInfo?.id);

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
    const euroNormId = values.euroNormId !== EURO_NORM_NONE && values.euroNormId ? values.euroNormId : null;
    const payload: CarInfo = {
      id: initialCarInfo?.id ?? null,
      carType: {
        id: values.carTypeId,
        name: values.carTypeName.trim() || values.carTypeId,
        brand: initialCarInfo?.carType.brand,
        fuelType: initialCarInfo?.carType.fuelType,
      },
      year: Number(values.year),
      cylinderCc: Number(values.cylinderCc),
      co2Emission: Number(values.co2Emission),
      ecoscore: Number(values.ecoscore),
      euroNorm:
        euroNormId && values.euroNormName ? { id: euroNormId, name: values.euroNormName.trim() } : euroNormId ? { id: euroNormId } : null,
      consumption: Number(values.consumption),
      createdAt: initialCarInfo?.createdAt ?? null,
      updatedAt: initialCarInfo?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="carTypeId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.carType')}
              value={field.value}
              selectedLabel={form.watch('carTypeName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('carTypeName', option.name, { shouldValidate: true });
              }}
              apiPath="car-types"
              placeholder={t('form.placeholders.carType')}
              description={t('form.help.carType')}
              error={fieldState.error?.message}
              disabled={isSubmitting || isEdit}
            />
          )}
        />
        <Controller
          name="year"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.year')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.year')}
              error={fieldState.error?.message}
              disabled={isSubmitting || isEdit}
              step={1}
            />
          )}
        />
        <Controller
          name="cylinderCc"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.cylinderCc')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.cylinderCc')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="co2Emission"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.co2Emission')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.co2Emission')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="ecoscore"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.ecoscore')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.ecoscore')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              max={100}
              step={1}
            />
          )}
        />
        <Controller
          name="euroNormId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.euroNorm')}
              value={field.value}
              selectedLabel={field.value === EURO_NORM_NONE ? t('form.euroNormNone') : form.watch('euroNormName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('euroNormName', id === EURO_NORM_NONE ? '' : option.name, { shouldValidate: true });
              }}
              apiPath="euro-norms"
              appendOptions={[{ id: EURO_NORM_NONE, name: t('form.euroNormNone') }]}
              placeholder={t('form.placeholders.euroNorm')}
              description={t('form.help.euroNorm')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="consumption"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.consumption')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.consumption')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={0.01}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
