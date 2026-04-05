'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Province } from '@/domain/province.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';

export const PROVINCE_FORM_ID = 'province-editor-form';

interface ProvinceFormProps {
  initialProvince?: Province;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (province: Province) => Promise<void>;
}

interface ProvinceFormValues {
  name: string;
  fiscalRegionId: string;
  fiscalRegionName: string;
}

const getInitialState = (province?: Province): ProvinceFormValues => ({
  name: province?.name ?? '',
  fiscalRegionId: province?.fiscalRegion.id ?? '',
  fiscalRegionName: province?.fiscalRegion.name ?? '',
});

const createProvinceFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, tCommon('validation.required')).max(100),
    fiscalRegionId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    fiscalRegionName: z.string(),
  });

export function ProvinceForm({ initialProvince, formId = PROVINCE_FORM_ID, isSubmitting = false, onSubmit }: ProvinceFormProps) {
  const t = useTranslations('admin.provinces');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createProvinceFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialProvince), [initialProvince]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<ProvinceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Province = {
      id: initialProvince?.id ?? null,
      name: values.name.trim(),
      fiscalRegion: {
        id: values.fiscalRegionId,
        name: values.fiscalRegionName.trim() || values.fiscalRegionId,
      },
      createdAt: initialProvince?.createdAt ?? null,
      updatedAt: initialProvince?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

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
              disabled={isSubmitting}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
