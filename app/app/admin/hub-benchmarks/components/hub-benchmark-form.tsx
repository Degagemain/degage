'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';

export const HUB_BENCHMARK_FORM_ID = 'hub-benchmark-editor-form';

interface HubBenchmarkFormProps {
  initialHubBenchmark?: HubBenchmark;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (row: HubBenchmark) => Promise<void>;
}

interface FormValues {
  hubId: string;
  hubName: string;
  ownerKm: string;
  sharedMinKm: string;
  sharedMaxKm: string;
  sharedAvgKm: string;
}

const getInitialState = (row?: HubBenchmark): FormValues => ({
  hubId: row?.hub?.id ?? '',
  hubName: row?.hub?.name ?? '',
  ownerKm: row != null ? String(row.ownerKm) : '0',
  sharedMinKm: row != null ? String(row.sharedMinKm) : '0',
  sharedMaxKm: row != null ? String(row.sharedMaxKm) : '0',
  sharedAvgKm: row != null ? String(row.sharedAvgKm) : '0',
});

const createSchema = (tCommon: (key: string) => string) =>
  z.object({
    hubId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    hubName: z.string(),
    ownerKm: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    sharedMinKm: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    sharedMaxKm: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    sharedAvgKm: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
  });

export function HubBenchmarkForm({
  initialHubBenchmark,
  formId = HUB_BENCHMARK_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: HubBenchmarkFormProps) {
  const t = useTranslations('admin.hubBenchmarks');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialHubBenchmark), [initialHubBenchmark]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

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
    const payload: HubBenchmark = {
      id: initialHubBenchmark?.id ?? null,
      hub: { id: values.hubId, name: values.hubName.trim() || values.hubId },
      ownerKm: Number(values.ownerKm),
      sharedMinKm: Number(values.sharedMinKm),
      sharedMaxKm: Number(values.sharedMaxKm),
      sharedAvgKm: Number(values.sharedAvgKm),
      createdAt: initialHubBenchmark?.createdAt ?? null,
      updatedAt: initialHubBenchmark?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
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
              disabled={isSubmitting || Boolean(initialHubBenchmark?.id)}
            />
          )}
        />
        <Controller
          name="ownerKm"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.ownerKm')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.ownerKm')}
              error={fieldState.error?.message}
              disabled={isSubmitting || Boolean(initialHubBenchmark?.id)}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="sharedMinKm"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.sharedMinKm')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.sharedMinKm')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="sharedMaxKm"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.sharedMaxKm')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.sharedMaxKm')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="sharedAvgKm"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.sharedAvgKm')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.sharedAvgKm')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
