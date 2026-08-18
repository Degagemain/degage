'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import * as z from 'zod';

import type { EmailDesign } from '@/domain/email-design.model';
import type { EmailTemplate, EmailTemplateCode } from '@/domain/email-template.model';
import { emailTemplateCodeValues } from '@/domain/email-template.model';
import { ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { Page } from '@/domain/page.model';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AdminLocaleTabsControl } from '@/app/components/form/admin-locale-tabs-control';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';

export const EMAIL_TEMPLATE_FORM_ID = 'email-template-editor-form';

const TEXTAREA_VARIABLE_KEYS = new Set(['PREHEADER', 'BODY', 'FALLBACK_HINT', 'FOOTER']);

interface EmailTemplateFormProps {
  initialTemplate?: EmailTemplate;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (template: EmailTemplate) => Promise<void>;
}

interface EmailTemplateFormValues {
  code: EmailTemplateCode | undefined;
  designId: string;
  variables: Record<string, Record<ContentLocale, string>>;
}

const designOptionValue = (design: EmailDesign): string => design.alias || design.id;

const getInitialState = (template?: EmailTemplate): EmailTemplateFormValues => {
  const variables: Record<string, Record<ContentLocale, string>> = {};
  if (template?.translations) {
    for (const translation of template.translations) {
      if (!(translation.locale in emptyContentLocaleRecord())) continue;
      for (const [key, value] of Object.entries(translation.variables)) {
        if (!variables[key]) {
          variables[key] = emptyContentLocaleRecord();
        }
        variables[key][translation.locale as ContentLocale] = value;
      }
    }
  }

  return {
    code: template?.code,
    designId: template?.designId ?? '',
    variables,
  };
};

const translationsFromVariables = (variables: Record<string, Record<ContentLocale, string>>) =>
  contentLocales.map((locale) => ({
    locale,
    variables: Object.fromEntries(Object.entries(variables).map(([key, byLocale]) => [key, byLocale[locale] ?? ''])),
  }));

export function EmailTemplateForm({
  initialTemplate,
  formId = EMAIL_TEMPLATE_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: EmailTemplateFormProps) {
  const t = useTranslations('admin.emailTemplates');
  const tCommon = useTranslations('admin.common');
  const isEdit = Boolean(initialTemplate?.id);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(defaultContentLocale);
  const [designs, setDesigns] = useState<EmailDesign[]>([]);
  const [designsError, setDesignsError] = useState<string | null>(null);
  const [variableKeys, setVariableKeys] = useState<string[]>(() => Object.keys(getInitialState(initialTemplate).variables));

  const schema = useMemo(
    () =>
      z.object({
        code: z.enum(emailTemplateCodeValues, { message: tCommon('validation.required') }),
        designId: z.string().trim().min(1, tCommon('validation.required')),
        variables: z.record(z.string(), z.record(z.string(), z.string())),
      }),
    [tCommon],
  );

  const initialState = useMemo(() => getInitialState(initialTemplate), [initialTemplate]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(schema) as Resolver<EmailTemplateFormValues>,
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
    setActiveLocale(defaultContentLocale);
    setVariableKeys(Object.keys(initialState.variables));
  }, [form, initialState, initialStateKey]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/email-designs');
        if (!response.ok) {
          throw new Error(t('form.designsLoadError'));
        }
        const result: Page<EmailDesign> = await response.json();
        if (cancelled) return;
        setDesigns(result.records);
        setDesignsError(null);
      } catch {
        if (!cancelled) {
          setDesignsError(t('form.designsLoadError'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const selectedDesignId = form.watch('designId');

  useEffect(() => {
    if (!selectedDesignId) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/email-designs/${encodeURIComponent(selectedDesignId)}`);
        if (!response.ok) return;
        const design: EmailDesign = await response.json();
        if (cancelled) return;
        const keys = design.variables.map((variable) => variable.key);
        setVariableKeys(keys);
        const current = form.getValues('variables');
        const next: Record<string, Record<ContentLocale, string>> = {};
        for (const key of keys) {
          next[key] = current[key] ?? emptyContentLocaleRecord();
        }
        form.setValue('variables', next);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form, selectedDesignId]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: EmailTemplate = {
      id: initialTemplate?.id ?? null,
      code: values.code!,
      designId: values.designId.trim(),
      translations: translationsFromVariables(values.variables),
      createdAt: initialTemplate?.createdAt ?? null,
      updatedAt: initialTemplate?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  const designOptions = useMemo(() => {
    const options = designs.map((design) => ({
      value: designOptionValue(design),
      label: design.alias ? `${design.name} (${design.alias})` : design.name,
    }));
    if (selectedDesignId && !options.some((option) => option.value === selectedDesignId)) {
      options.unshift({ value: selectedDesignId, label: selectedDesignId });
    }
    return options;
  }, [designs, selectedDesignId]);

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={Boolean(fieldState.error)} className="max-w-xl">
              <FieldLabel>{t('columns.code')}</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting || isEdit}>
                  <SelectTrigger className="w-full max-w-md" size="sm">
                    <SelectValue placeholder={t('form.placeholders.code')} />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplateCodeValues.map((code) => (
                      <SelectItem key={code} value={code}>
                        {t(`codes.${code}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>{t('form.help.code')}</FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="designId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={Boolean(fieldState.error)} className="max-w-xl">
              <FieldLabel>{t('columns.design')}</FieldLabel>
              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger className="w-full max-w-md" size="sm">
                    <SelectValue placeholder={t('form.placeholders.design')} />
                  </SelectTrigger>
                  <SelectContent>
                    {designOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>{designsError ?? t('form.help.design')}</FieldDescription>
                <FieldError>{fieldState.error?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        {variableKeys.length > 0 ? (
          <Field className="max-w-xl">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel className="mb-0">{t('form.variables')}</FieldLabel>
              <AdminLocaleTabsControl
                locales={contentLocales}
                activeLocale={activeLocale}
                onLocaleChange={setActiveLocale}
                disabled={isSubmitting}
              />
            </div>
            <FieldDescription>{t('form.help.variables')}</FieldDescription>
            <div className="mt-3 flex flex-col gap-4">
              {variableKeys.map((key) => {
                const isTextarea = TEXTAREA_VARIABLE_KEYS.has(key);
                return (
                  <Controller
                    key={key}
                    name={`variables.${key}` as const}
                    control={form.control}
                    render={({ field }) => (
                      <Field className="max-w-xl">
                        <FieldLabel className="font-mono text-xs">{key}</FieldLabel>
                        <FieldContent>
                          {isTextarea ? (
                            <Textarea
                              value={field.value?.[activeLocale] ?? ''}
                              onChange={(event) =>
                                field.onChange({
                                  ...(field.value ?? emptyContentLocaleRecord()),
                                  [activeLocale]: event.target.value,
                                })
                              }
                              rows={key === 'BODY' ? 4 : 2}
                              disabled={isSubmitting}
                            />
                          ) : (
                            <Input
                              value={field.value?.[activeLocale] ?? ''}
                              onChange={(event) =>
                                field.onChange({
                                  ...(field.value ?? emptyContentLocaleRecord()),
                                  [activeLocale]: event.target.value,
                                })
                              }
                              disabled={isSubmitting}
                            />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />
                );
              })}
            </div>
          </Field>
        ) : null}
      </FieldGroup>
    </form>
  );
}
