'use client';

import { useEffect, useMemo, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { CarSticker } from '@/domain/car-sticker.model';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { AdminFileUploadField } from '@/app/admin/components/admin-file-upload-field';

export const CAR_STICKER_FORM_ID = 'car-sticker-editor-form';

interface CarStickerFormProps {
  initialCarSticker?: CarSticker;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (sticker: CarSticker) => Promise<void>;
  onImageUpload?: (file: File) => Promise<void>;
  onImageDownload?: () => Promise<void>;
}

interface CarStickerFormValues {
  name: string;
  isActive: boolean;
  isAlwaysIncluded: boolean;
}

const getInitialState = (sticker?: CarSticker): CarStickerFormValues => ({
  name: sticker?.name ?? '',
  isActive: sticker?.isActive ?? true,
  isAlwaysIncluded: sticker?.isAlwaysIncluded ?? false,
});

const createCarStickerFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, tCommon('validation.required')).max(100),
    isActive: z.boolean(),
    isAlwaysIncluded: z.boolean(),
  });

export function CarStickerForm({
  initialCarSticker,
  formId = CAR_STICKER_FORM_ID,
  isSubmitting = false,
  onSubmit,
  onImageUpload,
  onImageDownload,
}: CarStickerFormProps) {
  const t = useTranslations('admin.carStickers');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createCarStickerFormSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialCarSticker), [initialCarSticker]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);
  const isEdit = Boolean(initialCarSticker?.id);

  const form = useForm<CarStickerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CarSticker = {
      id: initialCarSticker?.id ?? null,
      name: values.name.trim(),
      isActive: values.isActive,
      isAlwaysIncluded: values.isAlwaysIncluded,
      image: initialCarSticker?.image ?? null,
      createdAt: initialCarSticker?.createdAt ?? null,
      updatedAt: initialCarSticker?.updatedAt ?? null,
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
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="car-sticker-is-active"
              label={t('columns.isActive')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.isActive')}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="isAlwaysIncluded"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="car-sticker-is-always-included"
              label={t('columns.isAlwaysIncluded')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.isAlwaysIncluded')}
              disabled={isSubmitting}
            />
          )}
        />
        {isEdit && onImageUpload ? (
          <AdminFileUploadField
            label={t('columns.image')}
            fileName={initialCarSticker?.image?.name}
            disabled={isSubmitting}
            translationsNs="admin.carStickers.form.image"
            onUpload={onImageUpload}
            onDownload={onImageDownload}
          />
        ) : null}
      </FieldGroup>
    </form>
  );
}
