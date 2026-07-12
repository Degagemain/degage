'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { CAR_TAX_EURO_NORM_ADJUSTMENT_FORM_ID, CarTaxEuroNormAdjustmentForm } from '../components/car-tax-euro-norm-adjustment-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const OVERVIEW_PATH = '/app/admin/car-tax-euro-norm-adjustments';

export default function NewCarTaxEuroNormAdjustmentPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (row: CarTaxEuroNormAdjustment) => {
    setIsSaving(true);
    try {
      const response = await apiPost('/api/car-tax-euro-norm-adjustments', row);

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
        <Button type="submit" form={CAR_TAX_EURO_NORM_ADJUSTMENT_FORM_ID} disabled={isSaving} variant="outline" size="sm">
          <Save className="size-3.5" />
          {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
        </Button>
      </AdminPageToolbar>
      <CarTaxEuroNormAdjustmentForm formId={CAR_TAX_EURO_NORM_ADJUSTMENT_FORM_ID} isSubmitting={isSaving} onSubmit={handleCreate} />
    </div>
  );
}
