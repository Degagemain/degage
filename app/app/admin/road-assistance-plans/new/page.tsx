'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { ROAD_ASSISTANCE_PLAN_FORM_ID, RoadAssistancePlanForm } from '../components/road-assistance-plan-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const ROAD_ASSISTANCE_PLANS_OVERVIEW_PATH = '/app/admin/road-assistance-plans';

export default function NewRoadAssistancePlanPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (roadAssistancePlan: RoadAssistancePlan) => {
    setIsSaving(true);
    try {
      const response = await apiPost('/api/road-assistance-plans', roadAssistancePlan);

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      router.push(ROAD_ASSISTANCE_PLANS_OVERVIEW_PATH);
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminPageToolbar>
        <Button type="submit" form={ROAD_ASSISTANCE_PLAN_FORM_ID} disabled={isSaving} variant="outline" size="sm">
          <Save className="size-3.5" />
          {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
        </Button>
      </AdminPageToolbar>
      <RoadAssistancePlanForm formId={ROAD_ASSISTANCE_PLAN_FORM_ID} isSubmitting={isSaving} onSubmit={handleCreate} />
    </div>
  );
}
