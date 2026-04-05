'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { CarType } from '@/domain/car-type.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';

export const CAR_TYPE_FORM_ID = 'car-type-editor-form';

interface CarTypeFormProps {
  initialCarType?: CarType;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (carType: CarType) => Promise<void>;
}

interface CarTypeFormValues {
  brandId: string;
  brandName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  name: string;
  ecoscore: string;
  isActive: boolean;
}

const getInitialState = (carType?: CarType): CarTypeFormValues => ({
  brandId: carType?.brand.id ?? '',
  brandName: carType?.brand.name ?? '',
  fuelTypeId: carType?.fuelType.id ?? '',
  fuelTypeName: carType?.fuelType.name ?? '',
  name: carType?.name ?? '',
  ecoscore: carType?.ecoscore != null ? String(carType.ecoscore) : '',
  isActive: carType?.isActive ?? true,
});

const createCarTypeFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    brandId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    brandName: z.string(),
    fuelTypeId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    fuelTypeName: z.string(),
    name: z.string().trim().min(1, tCommon('validation.required')).max(200),
    ecoscore: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((value) => {
        const n = Number(value);
        return Number.isInteger(n) && n >= 0 && n <= 100;
      }, tCommon('validation.ecoscoreRange')),
    isActive: z.boolean(),
  });

export function CarTypeForm({ initialCarType, formId = CAR_TYPE_FORM_ID, isSubmitting = false, onSubmit }: CarTypeFormProps) {
  const t = useTranslations('admin.carTypes');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createCarTypeFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialCarType), [initialCarType]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<CarTypeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CarType = {
      id: initialCarType?.id ?? null,
      brand: { id: values.brandId, name: values.brandName.trim() || values.brandId },
      fuelType: { id: values.fuelTypeId, name: values.fuelTypeName.trim() || values.fuelTypeId },
      name: values.name.trim(),
      ecoscore: Number(values.ecoscore),
      isActive: values.isActive,
      createdAt: initialCarType?.createdAt ?? null,
      updatedAt: initialCarType?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="brandId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.brand')}
              value={field.value}
              selectedLabel={form.watch('brandName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('brandName', option.name, { shouldValidate: true });
              }}
              apiPath="car-brands"
              placeholder={t('form.placeholders.brand')}
              description={t('form.help.brand')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="fuelTypeId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.fuelType')}
              value={field.value}
              selectedLabel={form.watch('fuelTypeName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('fuelTypeName', option.name, { shouldValidate: true });
              }}
              apiPath="fuel-types"
              placeholder={t('form.placeholders.fuelType')}
              description={t('form.help.fuelType')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

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
          name="ecoscore"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.ecoscore')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.ecoscore')}
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
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="car-type-is-active"
              label={t('columns.active')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.active')}
              disabled={isSubmitting}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
