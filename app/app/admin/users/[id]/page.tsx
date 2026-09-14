'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { User } from '@/domain/user.model';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { USER_FORM_ID, UserForm } from '../components/user-form';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

export default function EditUserPage() {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('admin.common');
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!id) {
      setError(tCommon('feedback.loadError'));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error(tCommon('feedback.loadError'));
      }
      const data: User = await response.json();
      setUser(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tCommon('feedback.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, tCommon]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSave = async (payload: User) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const response = await apiPut(`/api/users/${id}`, { ...payload, id });

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'), {
          last_admin: t('errors.lastAdmin'),
        });
        toast.error(message);
        return;
      }

      toast.success(tCommon('feedback.saveSuccess'));
      await loadUser();
    } catch {
      toast.error(tCommon('feedback.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
          <button onClick={loadUser} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminPageToolbar>
        <Button type="submit" form={USER_FORM_ID} disabled={isLoading || isSaving || !user} variant="outline" size="sm">
          <Save className="size-3.5" />
          {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
        </Button>
      </AdminPageToolbar>

      {isLoading ? (
        <div className="space-y-6 px-3 py-4 md:px-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        user && <UserForm formId={USER_FORM_ID} initialUser={user} isSubmitting={isSaving} onSubmit={handleSave} />
      )}
    </div>
  );
}
