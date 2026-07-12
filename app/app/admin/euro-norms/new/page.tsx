'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { EuroNorm } from '@/domain/euro-norm.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { EURO_NORM_FORM_ID, EuroNormForm } from '../components/euro-norm-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const OVERVIEW_PATH = '/app/admin/euro-norms';

export default function NewEuroNormPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (euroNorm: EuroNorm) => {
    setIsSaving(true);
    try {
      const response = await apiPost('/api/euro-norms', euroNorm);

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      router.push(OVERVIEW_PATH);
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminPageToolbar>
        <Button type="submit" form={EURO_NORM_FORM_ID} disabled={isSaving} variant="outline" size="sm">
          <Save className="size-3.5" />
          {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
        </Button>
      </AdminPageToolbar>
      <EuroNormForm formId={EURO_NORM_FORM_ID} isSubmitting={isSaving} onSubmit={handleCreate} />
    </div>
  );
}
