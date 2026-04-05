'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';

export const INSURANCE_PRICE_BENCHMARK_FORM_ID = 'insurance-price-benchmark-editor-form';

interface InsurancePriceBenchmarkFormProps {
  initial?: InsurancePriceBenchmark;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (row: InsurancePriceBenchmark) => Promise<void>;
}

interface FormValues {
  year: string;
  maxCarPrice: string;
  baseRate: string;
  rate: string;
}

const getInitialState = (row?: InsurancePriceBenchmark): FormValues => ({
  year: row != null ? String(row.year) : String(new Date().getFullYear()),
  maxCarPrice: row != null ? String(row.maxCarPrice) : '0',
  baseRate: row != null ? String(row.baseRate) : '0',
  rate: row != null ? String(row.rate) : '0',
});

const createSchema = (tCommon: (key: string) => string) =>
  z.object({
    year: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 2000 && n <= 2100;
      }, tCommon('validation.yearRange')),
    maxCarPrice: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeInteger')),
    baseRate: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeNumber')),
    rate: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, tCommon('validation.nonNegativeNumber')),
  });

export function InsurancePriceBenchmarkForm({
  initial,
  formId = INSURANCE_PRICE_BENCHMARK_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: InsurancePriceBenchmarkFormProps) {
  const t = useTranslations('admin.insurancePriceBenchmarks');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initial), [initial]);
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
    const payload: InsurancePriceBenchmark = {
      id: initial?.id ?? null,
      year: Number(values.year),
      maxCarPrice: Number(values.maxCarPrice),
      baseRate: Number(values.baseRate),
      rate: Number(values.rate),
      createdAt: initial?.createdAt ?? null,
      updatedAt: initial?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="year"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.year')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.year')}
              error={fieldState.error?.message}
              disabled={isSubmitting || Boolean(initial?.id)}
              min={2000}
              max={2100}
              step={1}
            />
          )}
        />
        <Controller
          name="maxCarPrice"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.maxCarPrice')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.maxCarPrice')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={1}
            />
          )}
        />
        <Controller
          name="baseRate"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.baseRate')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.baseRate')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={0.01}
            />
          )}
        />
        <Controller
          name="rate"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.rate')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.rate')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={0.01}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
