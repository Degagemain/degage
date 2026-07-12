'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { apiDelete, apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { ROAD_ASSISTANCE_PLAN_FORM_ID, RoadAssistancePlanForm } from '../components/road-assistance-plan-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const ROAD_ASSISTANCE_PLANS_OVERVIEW_PATH = '/app/admin/road-assistance-plans';

export default function EditRoadAssistancePlanPage() {
  const t = useTranslations('admin.roadAssistancePlans');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [roadAssistancePlan, setRoadAssistancePlan] = useState<RoadAssistancePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoadAssistancePlan = useCallback(async () => {
    if (!id) {
      setError(tCommon('feedback.loadError'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/road-assistance-plans/${id}`);
      if (!response.ok) {
        throw new Error(tCommon('feedback.loadError'));
      }
      const data: RoadAssistancePlan = await response.json();
      setRoadAssistancePlan(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tCommon('feedback.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, tCommon]);

  useEffect(() => {
    loadRoadAssistancePlan();
  }, [loadRoadAssistancePlan]);

  const handleSave = async (payload: RoadAssistancePlan) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/road-assistance-plans/${id}`, { ...payload, id });

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      await loadRoadAssistancePlan();
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const response = await apiDelete(`/api/road-assistance-plans/${id}`);
    if (response.ok) {
      toast.success(t('delete.success'));
      setIsDeleteDialogOpen(false);
      router.push(ROAD_ASSISTANCE_PLANS_OVERVIEW_PATH);
      return;
    }
    if (response.status === 409) {
      toast.error(t('delete.conflict'));
      return;
    }
    toast.error(t('delete.error'));
  };

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button onClick={loadRoadAssistancePlan} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <AdminPageToolbar>
          <Button
            type="submit"
            form={ROAD_ASSISTANCE_PLAN_FORM_ID}
            disabled={isLoading || isSaving || !roadAssistancePlan}
            variant="outline"
            size="sm"
          >
            <Save className="size-3.5" />
            {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isLoading || isSaving || !roadAssistancePlan}
          >
            <Trash2 className="size-3.5" />
            {t('delete.confirm')}
          </Button>
        </AdminPageToolbar>

        {isLoading ? (
          <div className="space-y-6 px-3 py-4 md:px-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          roadAssistancePlan && (
            <RoadAssistancePlanForm
              formId={ROAD_ASSISTANCE_PLAN_FORM_ID}
              initialRoadAssistancePlan={roadAssistancePlan}
              isSubmitting={isSaving}
              onSubmit={handleSave}
            />
          )
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { name: roadAssistancePlan?.name ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
