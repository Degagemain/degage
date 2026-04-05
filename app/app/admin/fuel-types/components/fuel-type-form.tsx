'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { FuelType } from '@/domain/fuel-type.model';
import { ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { AdminTranslatedStringField } from '@/app/components/form/admin-translated-string-field';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';

export const FUEL_TYPE_FORM_ID = 'fuel-type-editor-form';

interface FuelTypeFormProps {
  initialFuelType?: FuelType;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (fuelType: FuelType) => Promise<void>;
}

interface FuelTypeFormValues {
  code: string;
  isActive: boolean;
  pricePer: string;
  co2Contribution: string;
  translations: Record<ContentLocale, string>;
}

const getInitialState = (fuelType?: FuelType): FuelTypeFormValues => {
  const translations = emptyContentLocaleRecord();

  if (fuelType?.translations) {
    for (const translation of fuelType.translations) {
      if (translation.locale in translations) {
        translations[translation.locale as ContentLocale] = translation.name ?? '';
      }
    }
  }

  return {
    code: fuelType?.code ?? '',
    isActive: fuelType?.isActive ?? true,
    pricePer: fuelType?.pricePer != null ? String(fuelType.pricePer) : '0',
    co2Contribution: fuelType?.co2Contribution != null ? String(fuelType.co2Contribution) : '0',
    translations,
  };
};

const createFuelTypeFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    code: z.string().trim().min(1, tCommon('validation.required')),
    isActive: z.boolean(),
    pricePer: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, tCommon('validation.nonNegativeNumber')),
    co2Contribution: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 0, tCommon('validation.nonNegativeInteger')),
    translations: z.object({
      en: z.string().trim().min(1, tCommon('validation.required')),
      nl: z.string().trim().min(1, tCommon('validation.required')),
      fr: z.string().trim().min(1, tCommon('validation.required')),
    }),
  });

export function FuelTypeForm({ initialFuelType, formId = FUEL_TYPE_FORM_ID, isSubmitting = false, onSubmit }: FuelTypeFormProps) {
  const t = useTranslations('admin.fuelTypes');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createFuelTypeFormSchema(tCommon), [tCommon]);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(defaultContentLocale);
  const initialState = useMemo(() => getInitialState(initialFuelType), [initialFuelType]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<FuelTypeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
    setActiveLocale(defaultContentLocale);
  }, [form, initialState, initialStateKey]);

  const translationErrors = form.formState.errors.translations;

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: FuelType = {
      id: initialFuelType?.id ?? null,
      code: values.code.trim(),
      name: values.translations[activeLocale].trim(),
      isActive: values.isActive,
      pricePer: Number(values.pricePer),
      co2Contribution: Number(values.co2Contribution),
      translations: contentLocales.map((locale) => ({
        locale,
        name: values.translations[locale].trim(),
      })),
      createdAt: initialFuelType?.createdAt ?? null,
      updatedAt: initialFuelType?.updatedAt ?? null,
    };

    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextFieldControl
              label={t('columns.code')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.code')}
              description={t('form.help.code')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="fuel-type-is-active"
              label={t('columns.active')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.active')}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="pricePer"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.pricePer')}
              value={field.value}
              onChange={field.onChange}
              min={0}
              step={0.0001}
              description={t('form.help.pricePer')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="co2Contribution"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.co2Contribution')}
              value={field.value}
              onChange={field.onChange}
              min={0}
              step={1}
              description={t('form.help.co2Contribution')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <AdminTranslatedStringField<FuelTypeFormValues>
          control={form.control}
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          label={t('columns.name')}
          getPlaceholder={(locale) => t('form.placeholders.translationName', { locale: locale.toUpperCase() })}
          disabled={isSubmitting}
          errors={translationErrors}
        />
      </FieldGroup>
    </form>
  );
}
