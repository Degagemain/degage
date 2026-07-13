'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { AdminFileUploadField } from '@/app/admin/components/admin-file-upload-field';

interface AdminRegistrationCertificateFieldProps {
  label: string;
  fileName?: string | null;
  disabled?: boolean;
  namespace?: 'registrationCertificate' | 'inspectionCertificate' | 'pinkForm';
  translationsNs?: string;
  onUpload: (file: File) => Promise<void>;
  onDownload?: () => Promise<void>;
}

export function AdminRegistrationCertificateField({
  label,
  fileName,
  disabled = false,
  namespace = 'registrationCertificate',
  translationsNs,
  onUpload,
  onDownload,
}: AdminRegistrationCertificateFieldProps) {
  // Preserve the existing prop API while delegating to the shared admin component.
  const translationsNamespace = useMemo(() => translationsNs ?? `admin.carOnboardings.form.${namespace}`, [namespace, translationsNs]);

  // Keep the hook call (so invalid translation namespaces still error early in dev).
  useTranslations(translationsNamespace);

  return (
    <AdminFileUploadField
      label={label}
      fileName={fileName}
      disabled={disabled}
      translationsNs={translationsNamespace}
      onUpload={onUpload}
      onDownload={onDownload}
    />
  );
}
