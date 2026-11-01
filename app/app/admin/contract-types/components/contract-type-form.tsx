'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import * as z from 'zod';

import type { ContractType, ContractTypeCodeValue } from '@/domain/contract-type.model';
import { contractTypeCodeValues } from '@/domain/contract-type.model';
import type { User } from '@/domain/user.model';
import type { Page } from '@/domain/page.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { AdminSelectFieldControl } from '@/app/components/form/admin-select-field-control';
import { AdminMultiSelectFieldControl } from '@/app/components/form/admin-multi-select-field-control';

export const CONTRACT_TYPE_FORM_ID = 'contract-type-editor-form';

interface ContractTypeFormProps {
  initialContractType?: ContractType;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (contractType: ContractType) => Promise<void>;
}

interface ContractTypeFormValues {
  code: ContractTypeCodeValue | '';
  name: string;
  defaultSigneeId: string;
  defaultViewerIds: string[];
}

const NONE_VALUE = '__none__';

const getInitialState = (contractType?: ContractType): ContractTypeFormValues => ({
  code: contractType?.code ?? '',
  name: contractType?.name ?? '',
  defaultSigneeId: contractType?.defaultSignee?.id ?? NONE_VALUE,
  defaultViewerIds: contractType?.defaultViewers.map((viewer) => viewer.id) ?? [],
});

export function ContractTypeForm({
  initialContractType,
  formId = CONTRACT_TYPE_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: ContractTypeFormProps) {
  const t = useTranslations('admin.contractTypes');
  const tCommon = useTranslations('admin.common');
  const isEdit = Boolean(initialContractType?.id);
  const [admins, setAdmins] = useState<User[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);

  const schema = useMemo(
    () =>
      z.object({
        code: z.enum(contractTypeCodeValues, { message: tCommon('validation.required') }),
        name: z.string().trim().min(1, tCommon('validation.required')).max(100),
        defaultSigneeId: z.string(),
        defaultViewerIds: z.array(z.string()),
      }),
    [tCommon],
  );

  const initialState = useMemo(() => getInitialState(initialContractType), [initialContractType]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<ContractTypeFormValues>({
    resolver: zodResolver(schema) as Resolver<ContractTypeFormValues>,
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setAdminsLoading(true);
      try {
        const response = await fetch('/api/users?roles=admin&take=100&sortBy=name&sortOrder=asc');
        if (!response.ok) throw new Error('failed');
        const result: Page<User> = await response.json();
        if (!cancelled) setAdmins(result.records);
      } catch {
        if (!cancelled) setAdmins([]);
      } finally {
        if (!cancelled) setAdminsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const adminOptions = useMemo(
    () =>
      admins.map((admin) => ({
        value: admin.id,
        label: admin.name || admin.email,
      })),
    [admins],
  );

  const signeeOptions = useMemo(() => [{ value: NONE_VALUE, label: t('form.none') }, ...adminOptions], [adminOptions, t]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsed = schema.parse(values);
    const defaultSignee =
      parsed.defaultSigneeId && parsed.defaultSigneeId !== NONE_VALUE
        ? {
            id: parsed.defaultSigneeId,
            name: admins.find((admin) => admin.id === parsed.defaultSigneeId)?.name,
          }
        : null;

    const payload: ContractType = {
      id: initialContractType?.id ?? null,
      code: parsed.code,
      name: parsed.name.trim(),
      defaultSignee,
      defaultViewers: parsed.defaultViewerIds.map((id: string) => ({
        id,
        name: admins.find((admin) => admin.id === id)?.name,
      })),
      documensoTemplateEnvelopeId: initialContractType?.documensoTemplateEnvelopeId ?? null,
      createdAt: initialContractType?.createdAt ?? null,
      updatedAt: initialContractType?.updatedAt ?? null,
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
            <AdminSelectFieldControl
              label={t('columns.code')}
              value={field.value}
              onChange={field.onChange}
              options={contractTypeCodeValues.map((code) => ({ value: code, label: t(`codes.${code}`) }))}
              placeholder={t('form.placeholders.code')}
              description={t('form.help.code')}
              error={fieldState.error?.message}
              disabled={isSubmitting || isEdit}
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
          name="defaultSigneeId"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSelectFieldControl
              label={t('columns.defaultSignee')}
              value={field.value}
              onChange={field.onChange}
              options={signeeOptions}
              placeholder={t('form.placeholders.defaultSignee')}
              description={t('form.help.defaultSignee')}
              error={fieldState.error?.message}
              disabled={isSubmitting || adminsLoading}
            />
          )}
        />
        <Controller
          name="defaultViewerIds"
          control={form.control}
          render={({ field }) => (
            <AdminMultiSelectFieldControl
              label={t('columns.defaultViewers')}
              options={adminOptions}
              values={field.value}
              onValuesChange={field.onChange}
              placeholder={t('form.placeholders.defaultViewers')}
              description={t('form.help.defaultViewers')}
              disabled={isSubmitting}
              loading={adminsLoading}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
