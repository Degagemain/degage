'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CarBrand } from '@/domain/car-brand.model';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { CAR_BRAND_FORM_ID, CarBrandForm } from '../components/car-brand-form';

const OVERVIEW_PATH = '/app/admin/car-brands';

export default function EditCarBrandPage() {
  const t = useTranslations('admin.carBrands');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [carBrand, setCarBrand] = useState<CarBrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCarBrand = useCallback(async () => {
    if (!id) {
      setError(tCommon('feedback.loadError'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/car-brands/${id}`);
      if (!response.ok) {
        throw new Error(tCommon('feedback.loadError'));
      }
      const data: CarBrand = await response.json();
      setCarBrand(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tCommon('feedback.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, tCommon]);

  useEffect(() => {
    loadCarBrand();
  }, [loadCarBrand]);

  const handleSave = async (payload: CarBrand) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/car-brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          id,
        }),
      });

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      await loadCarBrand();
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const response = await fetch(`/api/car-brands/${id}`, { method: 'DELETE' });
    if (response.ok) {
      toast.success(t('delete.success'));
      setIsDeleteDialogOpen(false);
      router.push(OVERVIEW_PATH);
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
          <button onClick={loadCarBrand} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-3 md:px-4">
          <div className="flex h-14 items-center justify-start gap-2">
            <Button type="submit" form={CAR_BRAND_FORM_ID} disabled={isLoading || isSaving || !carBrand} variant="outline" size="sm">
              <Save className="size-3.5" />
              {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteDialogOpen(true)} disabled={isLoading || isSaving || !carBrand}>
              <Trash2 className="size-3.5" />
              {t('delete.confirm')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6 px-3 py-4 md:px-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          carBrand && <CarBrandForm formId={CAR_BRAND_FORM_ID} initialCarBrand={carBrand} isSubmitting={isSaving} onSubmit={handleSave} />
        )}
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t('delete.title')}
        description={t('delete.description', { name: carBrand?.name ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
