'use client';

import { type ReactNode, useMemo } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { ContentLocale, contentLocales } from '@/i18n/locales';
import { Field, FieldContent, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Textarea } from '@/app/components/ui/textarea';
import { AdminLocaleTabsControl } from './admin-locale-tabs-control';
import { emptyContentLocaleRecord } from './empty-content-locale-record';

type WithDescriptionTranslations = FieldValues & { descriptionTranslations: Record<ContentLocale, string> };

interface AdminTranslatedTextareaFieldProps<T extends WithDescriptionTranslations> {
  control: Control<T>;
  activeLocale: ContentLocale;
  onActiveLocaleChange: (locale: ContentLocale) => void;
  label: ReactNode;
  getPlaceholder: (locale: ContentLocale) => string;
  disabled?: boolean;
  errors?: Partial<Record<ContentLocale, { message?: string } | undefined>>;
  rows?: number;
}

export function AdminTranslatedTextareaField<T extends WithDescriptionTranslations>({
  control,
  activeLocale,
  onActiveLocaleChange,
  label,
  getPlaceholder,
  disabled,
  errors,
  rows = 4,
}: AdminTranslatedTextareaFieldProps<T>) {
  const localesWithErrors = useMemo(() => contentLocales.filter((locale) => Boolean(errors?.[locale])), [errors]);

  return (
    <Field className="max-w-xl">
      <FieldContent>
        <div className="flex items-center justify-between gap-3">
          <FieldLabel className="mb-0">{label}</FieldLabel>
          <AdminLocaleTabsControl
            locales={contentLocales}
            activeLocale={activeLocale}
            onLocaleChange={onActiveLocaleChange}
            errorLocales={localesWithErrors}
            disabled={disabled}
          />
        </div>

        <Controller
          name={'descriptionTranslations' as FieldPath<T>}
          control={control}
          render={({ field }) => (
            <>
              <Textarea
                value={field.value?.[activeLocale] ?? ''}
                onChange={(event) =>
                  field.onChange({
                    ...(field.value ?? emptyContentLocaleRecord()),
                    [activeLocale]: event.target.value,
                  })
                }
                placeholder={getPlaceholder(activeLocale)}
                aria-invalid={Boolean(errors?.[activeLocale])}
                disabled={disabled}
                rows={rows}
              />
              <FieldError>{errors?.[activeLocale]?.message as string | undefined}</FieldError>
            </>
          )}
        />
      </FieldContent>
    </Field>
  );
}
