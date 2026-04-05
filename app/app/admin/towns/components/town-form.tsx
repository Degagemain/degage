'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Town } from '@/domain/town.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';

export const TOWN_FORM_ID = 'town-editor-form';

interface TownFormProps {
  initialTown?: Town;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (town: Town) => Promise<void>;
}

interface TownFormValues {
  zip: string;
  name: string;
  municipality: string;
  provinceId: string;
  provinceName: string;
  hubId: string;
  hubName: string;
  highDemand: boolean;
  hasActiveMembers: boolean;
}

const getInitialState = (town?: Town): TownFormValues => ({
  zip: town?.zip ?? '',
  name: town?.name ?? '',
  municipality: town?.municipality ?? '',
  provinceId: town?.province.id ?? '',
  provinceName: town?.province.name ?? '',
  hubId: town?.hub.id ?? '',
  hubName: town?.hub.name ?? '',
  highDemand: town?.highDemand ?? false,
  hasActiveMembers: town?.hasActiveMembers ?? false,
});

const createTownFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    zip: z.string().trim().min(1, tCommon('validation.required')).max(20),
    name: z.string().trim().min(1, tCommon('validation.required')).max(200),
    municipality: z.string().trim().min(1, tCommon('validation.required')).max(200),
    provinceId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    provinceName: z.string(),
    hubId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    hubName: z.string(),
    highDemand: z.boolean(),
    hasActiveMembers: z.boolean(),
  });

export function TownForm({ initialTown, formId = TOWN_FORM_ID, isSubmitting = false, onSubmit }: TownFormProps) {
  const t = useTranslations('admin.towns');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createTownFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialTown), [initialTown]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<TownFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Town = {
      id: initialTown?.id ?? null,
      zip: values.zip.trim(),
      name: values.name.trim(),
      municipality: values.municipality.trim(),
      province: {
        id: values.provinceId,
        name: values.provinceName.trim() || values.provinceId,
      },
      hub: {
        id: values.hubId,
        name: values.hubName.trim() || values.hubId,
      },
      highDemand: values.highDemand,
      hasActiveMembers: values.hasActiveMembers,
      createdAt: initialTown?.createdAt ?? null,
      updatedAt: initialTown?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="zip"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextFieldControl
              label={t('columns.zip')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.zip')}
              description={t('form.help.zip')}
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
          name="municipality"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextFieldControl
              label={t('columns.municipality')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.municipality')}
              description={t('form.help.municipality')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="provinceId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.province')}
              value={field.value}
              selectedLabel={form.watch('provinceName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('provinceName', option.name, { shouldValidate: true });
              }}
              apiPath="provinces"
              placeholder={t('form.placeholders.province')}
              description={t('form.help.province')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="hubId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.hub')}
              value={field.value}
              selectedLabel={form.watch('hubName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('hubName', option.name, { shouldValidate: true });
              }}
              apiPath="hubs"
              placeholder={t('form.placeholders.hub')}
              description={t('form.help.hub')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="highDemand"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="town-high-demand"
              label={t('columns.highDemand')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.highDemand')}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="hasActiveMembers"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="town-active-members"
              label={t('columns.hasActiveMembers')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.activeMembers')}
              disabled={isSubmitting}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
