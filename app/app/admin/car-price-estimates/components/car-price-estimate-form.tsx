'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';
import { AdminTextareaFieldControl } from '@/app/components/form/admin-textarea-field-control';

export const CAR_PRICE_ESTIMATE_FORM_ID = 'car-price-estimate-editor-form';

interface CarPriceEstimateFormProps {
  initialCarPriceEstimate?: CarPriceEstimate;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (row: CarPriceEstimate) => Promise<void>;
}

interface FormValues {
  carTypeId: string;
  carTypeName: string;
  year: string;
  estimateYear: string;
  price: string;
  rangeMin: string;
  rangeMax: string;
  prompt: string;
  remarks: string;
  articleRefs: string;
}

const getInitialState = (row?: CarPriceEstimate): FormValues => ({
  carTypeId: row?.carType.id ?? '',
  carTypeName: row?.carType.name ?? '',
  year: row != null ? String(row.year) : '',
  estimateYear: row != null ? String(row.estimateYear) : '',
  price: row != null ? String(row.price) : '',
  rangeMin: row != null ? String(row.rangeMin) : '',
  rangeMax: row != null ? String(row.rangeMax) : '',
  prompt: row?.prompt ?? '',
  remarks: row?.remarks ?? '',
  articleRefs: row?.articleRefs?.length ? row.articleRefs.join('\n') : '',
});

const createSchema = (tCommon: (key: string) => string) =>
  z.object({
    carTypeId: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((id) => z.uuid().safeParse(id).success, tCommon('validation.required')),
    carTypeName: z.string(),
    year: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)), tCommon('validation.integer')),
    estimateYear: z
      .string()
      .trim()
      .min(1, tCommon('validation.required'))
      .refine((v) => Number.isInteger(Number(v)), tCommon('validation.integer')),
    price: z.string().trim().min(1, tCommon('validation.required')),
    rangeMin: z.string().trim().min(1, tCommon('validation.required')),
    rangeMax: z.string().trim().min(1, tCommon('validation.required')),
    prompt: z.string(),
    remarks: z.string(),
    articleRefs: z.string(),
  });

export function CarPriceEstimateForm({
  initialCarPriceEstimate,
  formId = CAR_PRICE_ESTIMATE_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: CarPriceEstimateFormProps) {
  const t = useTranslations('admin.carPriceEstimates');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialCarPriceEstimate), [initialCarPriceEstimate]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);
  const isEdit = Boolean(initialCarPriceEstimate?.id);

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
    const articleRefs = values.articleRefs
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const payload: CarPriceEstimate = {
      id: initialCarPriceEstimate?.id ?? null,
      carType: {
        id: values.carTypeId,
        name: values.carTypeName.trim() || values.carTypeId,
        brand: initialCarPriceEstimate?.carType.brand,
        fuelType: initialCarPriceEstimate?.carType.fuelType,
      },
      year: Number(values.year),
      estimateYear: Number(values.estimateYear),
      price: Number(values.price),
      rangeMin: Number(values.rangeMin),
      rangeMax: Number(values.rangeMax),
      prompt: values.prompt.trim() || null,
      remarks: values.remarks.trim() || null,
      articleRefs,
      createdAt: initialCarPriceEstimate?.createdAt ?? null,
      updatedAt: initialCarPriceEstimate?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="carTypeId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.carType')}
              value={field.value}
              selectedLabel={form.watch('carTypeName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('carTypeName', option.name, { shouldValidate: true });
              }}
              apiPath="car-types"
              placeholder={t('form.placeholders.carType')}
              description={t('form.help.carType')}
              error={fieldState.error?.message}
              disabled={isSubmitting || isEdit}
            />
          )}
        />
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
              disabled={isSubmitting || isEdit}
              step={1}
            />
          )}
        />
        <Controller
          name="estimateYear"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.estimateYear')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.estimateYear')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              step={1}
            />
          )}
        />
        <Controller
          name="price"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.price')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.price')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={0.01}
            />
          )}
        />
        <Controller
          name="rangeMin"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.rangeMin')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.rangeMin')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={0.01}
            />
          )}
        />
        <Controller
          name="rangeMax"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminNumberFieldControl
              label={t('columns.rangeMax')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.rangeMax')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              min={0}
              step={0.01}
            />
          )}
        />
        <Controller
          name="prompt"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextareaFieldControl
              label={t('form.fields.prompt')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.prompt')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              rows={3}
            />
          )}
        />
        <Controller
          name="remarks"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextareaFieldControl
              label={t('columns.remarks')}
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.remarks')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              rows={3}
            />
          )}
        />
        <Controller
          name="articleRefs"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextareaFieldControl
              label={t('form.fields.articleRefs')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.articleRefs')}
              description={t('form.help.articleRefs')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
              rows={4}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
