'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { Insurer } from '@/domain/insurer.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { INSURER_FORM_ID, InsurerForm } from '../components/insurer-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const OVERVIEW_PATH = '/app/admin/insurers';

export default function NewInsurerPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (insurer: Insurer) => {
    setIsSaving(true);
    try {
      const response = await apiPost('/api/insurers', insurer);

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
        <Button type="submit" form={INSURER_FORM_ID} disabled={isSaving} variant="outline" size="sm">
          <Save className="size-3.5" />
          {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
        </Button>
      </AdminPageToolbar>
      <InsurerForm formId={INSURER_FORM_ID} isSubmitting={isSaving} onSubmit={handleCreate} />
    </div>
  );
}
