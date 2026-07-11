'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTranslatedStringField } from '@/app/components/form/admin-translated-string-field';
import { AdminTranslatedTextareaField } from '@/app/components/form/admin-translated-textarea-field';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';

export const ROAD_ASSISTANCE_PLAN_FORM_ID = 'road-assistance-plan-editor-form';

interface RoadAssistancePlanFormProps {
  initialRoadAssistancePlan?: RoadAssistancePlan;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (roadAssistancePlan: RoadAssistancePlan) => Promise<void>;
}

interface RoadAssistancePlanFormValues {
  isActive: boolean;
  translations: Record<ContentLocale, string>;
  descriptionTranslations: Record<ContentLocale, string>;
}

const getInitialState = (roadAssistancePlan?: RoadAssistancePlan): RoadAssistancePlanFormValues => {
  const translations = emptyContentLocaleRecord();
  const descriptionTranslations = emptyContentLocaleRecord();

  if (roadAssistancePlan?.translations) {
    for (const translation of roadAssistancePlan.translations) {
      if (translation.locale in translations) {
        translations[translation.locale as ContentLocale] = translation.name ?? '';
        descriptionTranslations[translation.locale as ContentLocale] = translation.description ?? '';
      }
    }
  }

  return {
    isActive: roadAssistancePlan?.isActive ?? true,
    translations,
    descriptionTranslations,
  };
};

const createRoadAssistancePlanFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    isActive: z.boolean(),
    translations: z.object({
      en: z.string().trim().min(1, tCommon('validation.required')),
      nl: z.string().trim().min(1, tCommon('validation.required')),
      fr: z.string().trim().min(1, tCommon('validation.required')),
    }),
    descriptionTranslations: z.object({
      en: z.string().max(2000),
      nl: z.string().max(2000),
      fr: z.string().max(2000),
    }),
  });

export function RoadAssistancePlanForm({
  initialRoadAssistancePlan,
  formId = ROAD_ASSISTANCE_PLAN_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: RoadAssistancePlanFormProps) {
  const t = useTranslations('admin.roadAssistancePlans');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createRoadAssistancePlanFormSchema(tCommon), [tCommon]);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(defaultContentLocale);
  const initialState = useMemo(() => getInitialState(initialRoadAssistancePlan), [initialRoadAssistancePlan]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<RoadAssistancePlanFormValues>({
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
  const descriptionErrors = form.formState.errors.descriptionTranslations;

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: RoadAssistancePlan = {
      id: initialRoadAssistancePlan?.id ?? null,
      name: values.translations[activeLocale].trim(),
      description: values.descriptionTranslations[activeLocale].trim(),
      isActive: values.isActive,
      translations: contentLocales.map((locale) => ({
        locale,
        name: values.translations[locale].trim(),
        description: values.descriptionTranslations[locale].trim(),
      })),
      createdAt: initialRoadAssistancePlan?.createdAt ?? null,
      updatedAt: initialRoadAssistancePlan?.updatedAt ?? null,
    };

    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="road-assistance-plan-is-active"
              label={t('columns.active')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.active')}
              disabled={isSubmitting}
            />
          )}
        />

        <AdminTranslatedStringField<RoadAssistancePlanFormValues>
          control={form.control}
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          label={t('columns.name')}
          getPlaceholder={(locale) => t('form.placeholders.translationName', { locale: locale.toUpperCase() })}
          disabled={isSubmitting}
          errors={translationErrors}
        />

        <AdminTranslatedTextareaField<RoadAssistancePlanFormValues>
          control={form.control}
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          label={t('columns.description')}
          getPlaceholder={(locale) => t('form.placeholders.translationDescription', { locale: locale.toUpperCase() })}
          disabled={isSubmitting}
          errors={descriptionErrors}
        />
      </FieldGroup>
    </form>
  );
}
