'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { CarInfo } from '@/domain/car-info.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { CAR_INFO_FORM_ID, CarInfoForm } from '../components/car-info-form';

const OVERVIEW_PATH = '/app/admin/car-infos';

export default function NewCarInfoPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (row: CarInfo) => {
    setIsSaving(true);
    try {
      const response = await apiPost('/api/car-infos', row);

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
      <div className="border-b px-3 md:px-4">
        <div className="flex h-14 items-center justify-start gap-2">
          <Button type="submit" form={CAR_INFO_FORM_ID} disabled={isSaving} variant="outline" size="sm">
            <Save className="size-3.5" />
            {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
          </Button>
        </div>
      </div>
      <CarInfoForm formId={CAR_INFO_FORM_ID} isSubmitting={isSaving} onSubmit={handleCreate} />
    </div>
  );
}
