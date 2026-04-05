'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { CarBrand } from '@/domain/car-brand.model';
import { ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { AdminTranslatedStringField } from '@/app/components/form/admin-translated-string-field';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';

export const CAR_BRAND_FORM_ID = 'car-brand-editor-form';

interface CarBrandFormProps {
  initialCarBrand?: CarBrand;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (carBrand: CarBrand) => Promise<void>;
}

interface CarBrandFormValues {
  code: string;
  isActive: boolean;
  translations: Record<ContentLocale, string>;
}

const getInitialState = (carBrand?: CarBrand): CarBrandFormValues => {
  const translations = emptyContentLocaleRecord();
  if (carBrand?.translations) {
    for (const translation of carBrand.translations) {
      if (translation.locale in translations) {
        translations[translation.locale as ContentLocale] = translation.name ?? '';
      }
    }
  }
  return {
    code: carBrand?.code ?? '',
    isActive: carBrand?.isActive ?? true,
    translations,
  };
};

const createCarBrandFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    code: z.string().trim().min(1, tCommon('validation.required')),
    isActive: z.boolean(),
    translations: z.object({
      en: z.string().trim().min(1, tCommon('validation.required')),
      nl: z.string().trim().min(1, tCommon('validation.required')),
      fr: z.string().trim().min(1, tCommon('validation.required')),
    }),
  });

export function CarBrandForm({ initialCarBrand, formId = CAR_BRAND_FORM_ID, isSubmitting = false, onSubmit }: CarBrandFormProps) {
  const t = useTranslations('admin.carBrands');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createCarBrandFormSchema(tCommon), [tCommon]);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(defaultContentLocale);
  const initialState = useMemo(() => getInitialState(initialCarBrand), [initialCarBrand]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<CarBrandFormValues>({
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
    const code = values.code.trim().toLowerCase();
    const payload: CarBrand = {
      id: initialCarBrand?.id ?? null,
      code,
      name: values.translations[activeLocale].trim(),
      isActive: values.isActive,
      translations: contentLocales.map((locale) => ({
        locale,
        name: values.translations[locale].trim(),
      })),
      createdAt: initialCarBrand?.createdAt ?? null,
      updatedAt: initialCarBrand?.updatedAt ?? null,
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
              id="car-brand-is-active"
              label={t('columns.active')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.active')}
              disabled={isSubmitting}
            />
          )}
        />

        <AdminTranslatedStringField<CarBrandFormValues>
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
