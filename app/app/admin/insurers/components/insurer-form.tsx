'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Insurer } from '@/domain/insurer.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';

export const INSURER_FORM_ID = 'insurer-editor-form';

interface InsurerFormProps {
  initialInsurer?: Insurer;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (insurer: Insurer) => Promise<void>;
}

interface InsurerFormValues {
  name: string;
}

const getInitialState = (insurer?: Insurer): InsurerFormValues => ({
  name: insurer?.name ?? '',
});

const createInsurerFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, tCommon('validation.required')).max(100),
  });

export function InsurerForm({ initialInsurer, formId = INSURER_FORM_ID, isSubmitting = false, onSubmit }: InsurerFormProps) {
  const t = useTranslations('admin.insurers');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createInsurerFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialInsurer), [initialInsurer]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<InsurerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Insurer = {
      id: initialInsurer?.id ?? null,
      name: values.name.trim(),
      createdAt: initialInsurer?.createdAt ?? null,
      updatedAt: initialInsurer?.updatedAt ?? null,
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
      </FieldGroup>
    </form>
  );
}
