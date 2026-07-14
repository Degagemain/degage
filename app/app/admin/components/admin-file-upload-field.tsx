'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES } from '@/domain/document.model';
import { getMaxUploadFileSizeBytes, getMaxUploadFileSizeMb } from '@/lib/max-upload-file-size';
import { Button } from '@/app/components/ui/button';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';

const DEFAULT_ACCEPT = REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES.join(',');

type AdminFileUploadFieldProps = {
  label: string;
  fileName?: string | null;
  disabled?: boolean;
  accept?: string;
  translationsNs: string;
  onUpload: (file: File) => Promise<void>;
  onDownload?: () => Promise<void>;
};

export function AdminFileUploadField({
  label,
  fileName,
  disabled = false,
  accept = DEFAULT_ACCEPT,
  translationsNs,
  onUpload,
  onDownload,
}: AdminFileUploadFieldProps) {
  const t = useTranslations(translationsNs);
  const maxSizeMb = getMaxUploadFileSizeMb();
  const maxSizeBytes = getMaxUploadFileSizeBytes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    if (file.size > maxSizeBytes) {
      setError(t('fileTooLarge', { maxSizeMb }));
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : t('uploadError');
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!onDownload) return;
    setError(null);
    setIsDownloading(true);
    try {
      await onDownload();
    } catch {
      setError(t('downloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Field data-invalid={Boolean(error)} className="max-w-xl">
      <FieldLabel>{label}</FieldLabel>
      <FieldContent className="gap-3">
        {fileName ? (
          <p className="text-muted-foreground text-sm">
            {t('currentFile')}:{' '}
            {onDownload ? (
              <button
                type="button"
                className="text-foreground hover:text-primary font-medium underline underline-offset-4"
                disabled={disabled || isDownloading}
                onClick={() => void handleDownload()}
              >
                {isDownloading ? t('downloading') : fileName}
              </button>
            ) : (
              <span className="text-foreground font-medium">{fileName}</span>
            )}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">{t('noFile')}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(event) => void handleFileChange(event)}
          />
          <Button type="button" variant="outline" size="sm" disabled={disabled || isUploading} onClick={() => inputRef.current?.click()}>
            <Upload className="size-3.5" />
            {isUploading ? t('uploading') : t('upload')}
          </Button>
        </div>

        <FieldDescription>{t('help', { maxSizeMb })}</FieldDescription>
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
