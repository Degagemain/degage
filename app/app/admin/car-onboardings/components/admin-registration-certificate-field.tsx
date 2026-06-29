'use client';

import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES } from '@/domain/document.model';
import { Button } from '@/app/components/ui/button';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';

const ACCEPT = REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES.join(',');

interface AdminRegistrationCertificateFieldProps {
  label: string;
  fileName?: string | null;
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
  onDownload?: () => Promise<void>;
}

export function AdminRegistrationCertificateField({
  label,
  fileName,
  disabled = false,
  onUpload,
  onDownload,
}: AdminRegistrationCertificateFieldProps) {
  const t = useTranslations('admin.carOnboardings.form.registrationCertificate');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError(t('uploadError'));
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
            {t('currentFile')}: <span className="text-foreground font-medium">{fileName}</span>
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">{t('noFile')}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(event) => void handleFileChange(event)}
          />
          <Button type="button" variant="outline" size="sm" disabled={disabled || isUploading} onClick={() => inputRef.current?.click()}>
            <Upload className="size-3.5" />
            {isUploading ? t('uploading') : t('upload')}
          </Button>
          {fileName && onDownload ? (
            <Button type="button" variant="outline" size="sm" disabled={disabled || isDownloading} onClick={() => void handleDownload()}>
              <Download className="size-3.5" />
              {isDownloading ? t('downloading') : t('download')}
            </Button>
          ) : null}
        </div>
        <FieldDescription>{t('help')}</FieldDescription>
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
