'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import type { Contract } from '@/domain/contract.model';
import { ContractStatus } from '@/domain/contract.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';

export const CONTRACT_FORM_ID = 'contract-editor-form';

interface ContractFormProps {
  initialContract?: Contract;
  formId?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  onSubmit: (contract: Contract) => Promise<void>;
}

interface ContractFormValues {
  userId: string;
  userName: string;
  typeId: string;
  typeName: string;
  startDate: string;
  endDate: string;
}

const toDateInput = (value: Date | null | undefined): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const getInitialState = (contract?: Contract): ContractFormValues => ({
  userId: contract?.user.id ?? '',
  userName: contract?.user.name ?? '',
  typeId: contract?.type.id ?? '',
  typeName: contract?.type.code ?? contract?.type.name ?? '',
  startDate: toDateInput(contract?.startDate),
  endDate: toDateInput(contract?.endDate),
});

export function ContractForm({
  initialContract,
  formId = CONTRACT_FORM_ID,
  isSubmitting = false,
  readOnly = false,
  onSubmit,
}: ContractFormProps) {
  const t = useTranslations('admin.contracts');
  const tCommon = useTranslations('admin.common');

  const schema = useMemo(
    () =>
      z
        .object({
          userId: z.string().min(1, tCommon('validation.required')),
          userName: z.string(),
          typeId: z.uuid({ message: tCommon('validation.required') }),
          typeName: z.string(),
          startDate: z.string().min(1, tCommon('validation.required')),
          endDate: z.string(),
        })
        .superRefine((values, ctx) => {
          if (values.endDate && values.endDate < values.startDate) {
            ctx.addIssue({
              code: 'custom',
              path: ['endDate'],
              message: t('form.validation.endBeforeStart'),
            });
          }
        }),
    [t, tCommon],
  );

  const initialState = useMemo(() => getInitialState(initialContract), [initialContract]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: Contract = {
      id: initialContract?.id ?? null,
      user: { id: values.userId, name: values.userName || undefined },
      type: { id: values.typeId, name: values.typeName || undefined },
      startDate: new Date(`${values.startDate}T00:00:00.000Z`),
      endDate: values.endDate ? new Date(`${values.endDate}T00:00:00.000Z`) : null,
      status: ContractStatus.Draft,
      document: null,
      documensoDocumentEnvelopeId: null,
      createdAt: initialContract?.createdAt ?? null,
      updatedAt: initialContract?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  const disabled = isSubmitting || readOnly;

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="userId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.user')}
              value={field.value}
              selectedLabel={form.watch('userName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('userName', option.name, { shouldValidate: true });
              }}
              apiPath="users"
              labelKey="name"
              descriptionKey="email"
              placeholder={t('form.placeholders.user')}
              description={t('form.help.user')}
              error={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          name="typeId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSearchableSelectField
              label={t('columns.type')}
              value={field.value}
              selectedLabel={form.watch('typeName') || undefined}
              onValueChange={(id, option) => {
                field.onChange(id);
                form.setValue('typeName', option.name, { shouldValidate: true });
              }}
              apiPath="contract-types"
              labelKey="code"
              placeholder={t('form.placeholders.type')}
              description={t('form.help.type')}
              error={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          name="startDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextFieldControl
              label={t('columns.startDate')}
              type="date"
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.startDate')}
              error={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          name="endDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextFieldControl
              label={t('columns.endDate')}
              type="date"
              value={field.value}
              onChange={field.onChange}
              description={t('form.help.endDate')}
              error={fieldState.error?.message}
              disabled={disabled}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
