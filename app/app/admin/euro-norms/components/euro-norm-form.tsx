'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { EuroNorm } from '@/domain/euro-norm.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminDateFieldControl } from '@/app/components/form/admin-date-field-control';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { formatDateForInput, parseDateInput } from '@/app/components/form/date-input-helpers';

export const EURO_NORM_FORM_ID = 'euro-norm-editor-form';

interface EuroNormFormProps {
  initialEuroNorm?: EuroNorm;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (euroNorm: EuroNorm) => Promise<void>;
}

interface EuroNormFormValues {
  code: string;
  name: string;
  group: string;
  isActive: boolean;
  start: string;
  end: string;
}

const getInitialState = (euroNorm?: EuroNorm): EuroNormFormValues => ({
  code: euroNorm?.code ?? '',
  name: euroNorm?.name ?? '',
  group: euroNorm?.group != null ? String(euroNorm.group) : '0',
  isActive: euroNorm?.isActive ?? true,
  start: formatDateForInput(euroNorm?.start),
  end: formatDateForInput(euroNorm?.end),
});

const createEuroNormFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    code: z.string().trim().min(1, tCommon('validation.required')).max(50),
    name: z.string().trim().min(1, tCommon('validation.required')).max(100),
    group: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    isActive: z.boolean(),
    start: z.string().trim().min(1, tCommon('validation.required')),
    end: z.string().trim(),
  });

export function EuroNormForm({ initialEuroNorm, formId = EURO_NORM_FORM_ID, isSubmitting = false, onSubmit }: EuroNormFormProps) {
  const t = useTranslations('admin.euroNorms');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createEuroNormFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialEuroNorm), [initialEuroNorm]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<EuroNormFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const startDate = parseDateInput(values.start);
    if (!startDate) {
      form.setError('start', { message: tCommon('validation.required') });
      return;
    }
    const endDate = parseDateInput(values.end);
    const payload: EuroNorm = {
      id: initialEuroNorm?.id ?? null,
      code: values.code.trim().toLowerCase().replace(/\s+/g, '-'),
      name: values.name.trim(),
      group: Number(values.group),
      isActive: values.isActive,
      start: startDate,
      end: endDate,
      createdAt: initialEuroNorm?.createdAt ?? null,
      updatedAt: initialEuroNorm?.updatedAt ?? null,
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
          name="group"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.group')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.group')}
              description={t('form.help.group')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="euro-norm-is-active"
              label={t('columns.active')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.active')}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="start"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminDateFieldControl
              label={t('columns.start')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.start')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="end"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminDateFieldControl
              label={t('columns.end')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.end')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
