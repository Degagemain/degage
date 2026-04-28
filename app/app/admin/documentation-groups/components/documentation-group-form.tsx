'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import type { DocumentationGroup } from '@/domain/documentation-group.model';
import { ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminTranslatedStringField } from '@/app/components/form/admin-translated-string-field';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';

export const DOCUMENTATION_GROUP_FORM_ID = 'documentation-group-editor-form';

interface DocumentationGroupFormProps {
  initialGroup?: DocumentationGroup;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (group: DocumentationGroup) => Promise<void>;
}

interface DocumentationGroupFormValues {
  order: string;
  translations: Record<ContentLocale, string>;
}

const getInitialState = (group?: DocumentationGroup): DocumentationGroupFormValues => {
  const translations = emptyContentLocaleRecord();

  if (group?.translations) {
    for (const translation of group.translations) {
      if (translation.locale in translations) {
        translations[translation.locale as ContentLocale] = translation.name ?? '';
      }
    }
  }

  return {
    order: group?.order != null ? String(group.order) : '0',
    translations,
  };
};

const createDocumentationGroupFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    order: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine(
        (value) => Number.isFinite(Number(value)) && Number.isInteger(Number(value)) && Number(value) >= 0,
        tCommon('validation.nonNegativeInteger'),
      ),
    translations: z.object({
      en: z.string().trim().min(1, tCommon('validation.required')),
      nl: z.string().trim().min(1, tCommon('validation.required')),
      fr: z.string().trim().min(1, tCommon('validation.required')),
    }),
  });

export function DocumentationGroupForm({
  initialGroup,
  formId = DOCUMENTATION_GROUP_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: DocumentationGroupFormProps) {
  const t = useTranslations('admin.documentationGroups');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createDocumentationGroupFormSchema(tCommon), [tCommon]);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(defaultContentLocale);
  const initialState = useMemo(() => getInitialState(initialGroup), [initialGroup]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<DocumentationGroupFormValues>({
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
    const payload: DocumentationGroup = {
      id: initialGroup?.id ?? null,
      order: Number.parseInt(values.order, 10),
      name: values.translations[activeLocale].trim(),
      translations: contentLocales.map((locale) => ({
        locale,
        name: values.translations[locale].trim(),
      })),
      createdAt: initialGroup?.createdAt ?? null,
      updatedAt: initialGroup?.updatedAt ?? null,
    };

    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="order"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.order')}
              value={field.value}
              onChange={field.onChange}
              min={0}
              step={1}
              description={t('form.help.order')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <AdminTranslatedStringField<DocumentationGroupFormValues>
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
