'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Role, roleValues } from '@/domain/role.model';
import { User } from '@/domain/user.model';
import { DEFAULT_LOCALE } from '@/domain/locale.model';
import { type UILocale, localeDisplayNames, uiLocales } from '@/i18n/locales';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSelectFieldControl } from '@/app/components/form/admin-select-field-control';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { AdminTextareaFieldControl } from '@/app/components/form/admin-textarea-field-control';

export const USER_FORM_ID = 'user-editor-form';

interface UserFormProps {
  initialUser: User;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (user: User) => Promise<void>;
}

interface UserFormValues {
  name: string;
  role: Role;
  locale: UILocale;
  banned: boolean;
  banReason: string;
}

const toUiLocale = (locale: string | null | undefined): UILocale => {
  if (locale && uiLocales.includes(locale as UILocale)) {
    return locale as UILocale;
  }
  return DEFAULT_LOCALE;
};

const getInitialState = (user: User): UserFormValues => ({
  name: user.name,
  role: user.role === Role.ADMIN ? Role.ADMIN : Role.USER,
  locale: toUiLocale(user.locale),
  banned: user.banned === true,
  banReason: user.banReason ?? '',
});

const createUserFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, tCommon('validation.required')).max(255),
    role: z.enum(roleValues),
    locale: z.enum(uiLocales),
    banned: z.boolean(),
    banReason: z.string(),
  });

export function UserForm({ initialUser, formId = USER_FORM_ID, isSubmitting = false, onSubmit }: UserFormProps) {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createUserFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialUser), [initialUser]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const banned = form.watch('banned');

  const roleOptions = useMemo(
    () => [
      { value: Role.ADMIN, label: t('roleAdmin') },
      { value: Role.USER, label: t('roleUser') },
    ],
    [t],
  );

  const localeOptions = useMemo(() => uiLocales.map((locale) => ({ value: locale, label: localeDisplayNames[locale] })), []);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: User = {
      ...initialUser,
      name: values.name.trim(),
      role: values.role,
      locale: values.locale,
      banned: values.banned,
      banReason: values.banned ? values.banReason.trim() || null : null,
      banExpires: values.banned ? initialUser.banExpires : null,
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
              description={t('form.help.name')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <AdminTextFieldControl
          label={t('columns.email')}
          value={initialUser.email}
          onChange={() => {}}
          description={t('form.help.email')}
          disabled
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSelectFieldControl
              label={t('columns.role')}
              value={field.value}
              onChange={field.onChange}
              options={roleOptions}
              description={t('form.help.role')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="locale"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminSelectFieldControl
              label={t('columns.language')}
              value={field.value}
              onChange={field.onChange}
              options={localeOptions}
              description={t('form.help.language')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <AdminSwitchFieldControl
          id="user-email-verified"
          label={t('columns.verified')}
          checked={initialUser.emailVerified}
          onChange={() => {}}
          description={t('form.help.verified')}
          disabled
        />

        <Controller
          name="banned"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="user-banned"
              label={t('statusBanned')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.status')}
              disabled={isSubmitting}
            />
          )}
        />

        {banned && (
          <Controller
            name="banReason"
            control={form.control}
            render={({ field, fieldState }) => (
              <AdminTextareaFieldControl
                label={t('form.banReason')}
                value={field.value}
                onChange={field.onChange}
                description={t('form.help.banReason')}
                error={fieldState.error?.message}
                disabled={isSubmitting}
                rows={3}
              />
            )}
          />
        )}
      </FieldGroup>
    </form>
  );
}
