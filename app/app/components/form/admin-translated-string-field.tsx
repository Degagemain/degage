'use client';

import { type ReactNode, useMemo } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { ContentLocale, contentLocales } from '@/i18n/locales';
import { Field, FieldContent, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { AdminLocaleTabsControl } from './admin-locale-tabs-control';
import { emptyContentLocaleRecord } from './empty-content-locale-record';

type WithTranslations = FieldValues & { translations: Record<ContentLocale, string> };

interface AdminTranslatedStringFieldProps<T extends WithTranslations> {
  control: Control<T>;
  activeLocale: ContentLocale;
  onActiveLocaleChange: (locale: ContentLocale) => void;
  label: ReactNode;
  getPlaceholder: (locale: ContentLocale) => string;
  disabled?: boolean;
  errors?: Partial<Record<ContentLocale, { message?: string } | undefined>>;
}

export function AdminTranslatedStringField<T extends WithTranslations>({
  control,
  activeLocale,
  onActiveLocaleChange,
  label,
  getPlaceholder,
  disabled,
  errors,
}: AdminTranslatedStringFieldProps<T>) {
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
          name={'translations' as FieldPath<T>}
          control={control}
          render={({ field }) => (
            <>
              <Input
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
              />
              <FieldError>{errors?.[activeLocale]?.message as string | undefined}</FieldError>
            </>
          )}
        />
      </FieldContent>
    </Field>
  );
}
