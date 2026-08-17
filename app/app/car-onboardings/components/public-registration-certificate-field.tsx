'use client';

import { useRef, useState } from 'react';
import { ExternalLink, Loader2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES } from '@/domain/document.model';
import { getMaxUploadFileSizeBytes, getMaxUploadFileSizeMb } from '@/lib/max-upload-file-size';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

import { PublicBtn, PublicField } from './public-ui';
import styles from '../car-onboarding-public.module.css';

const ACCEPT = REGISTRATION_CERTIFICATE_ALLOWED_CONTENT_TYPES.join(',');

type PublicRegistrationCertificateFieldProps = {
  label: string;
  hint: string;
  fileName?: string | null;
  disabled?: boolean;
  namespace?: 'registrationCertificate' | 'inspectionCertificate' | 'pinkForm' | 'proofOfPurchase';
  onUpload: (file: File) => Promise<void>;
  onDownload?: () => Promise<void>;
};

export function PublicRegistrationCertificateField({
  label,
  hint,
  fileName,
  disabled = false,
  namespace = 'registrationCertificate',
  onUpload,
  onDownload,
}: PublicRegistrationCertificateFieldProps) {
  const t = useTranslations(`carOnboardingPublic.steps.carInfo.${namespace}`);
  const tUpload = useTranslations('carOnboardingPublic.steps.carInfo.documentUpload');
  const maxSizeMb = getMaxUploadFileSizeMb();
  const maxSizeBytes = getMaxUploadFileSizeBytes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    if (file.size > maxSizeBytes) {
      setError(tUpload('fileTooLarge', { maxSizeMb }));
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
    <PublicField label={label} hint={hint}>
      <p className={styles.uploadFileStatus}>
        {fileName ? (
          <>
            {t('currentFile')}:{' '}
            {onDownload ? (
              <button
                type="button"
                className={styles.uploadFileLink}
                disabled={disabled || isDownloading}
                onClick={() => void handleDownload()}
              >
                {isDownloading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    {t('downloading')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    {fileName}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </span>
                )}
              </button>
            ) : (
              <span className={styles.uploadFileName}>{fileName}</span>
            )}
          </>
        ) : (
          t('noFile')
        )}
      </p>
      <div className={styles.uploadActions}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className={styles.uploadInput}
          disabled={disabled || isUploading}
          onChange={(event) => void handleFileChange(event)}
        />
        <PublicBtn type="button" variant="secondary" small disabled={disabled || isUploading} onClick={() => inputRef.current?.click()}>
          {isUploading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {t('uploading')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Upload className="size-3.5" aria-hidden />
              {t('upload')}
            </span>
          )}
        </PublicBtn>
      </div>
      <p className={styles.fieldHint}>
        {tUpload('help', { maxSizeMb })}{' '}
        <button type="button" className={styles.fieldHelpLink} onClick={() => setTipsOpen(true)}>
          {tUpload('tipsLink')}
        </button>
      </p>
      <Dialog open={tipsOpen} onOpenChange={setTipsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tUpload('tipsTitle')}</DialogTitle>
            <DialogDescription>{tUpload('tipsBody', { maxSizeMb })}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {error ? <p className={styles.fieldError}>{error}</p> : null}
    </PublicField>
  );
}
