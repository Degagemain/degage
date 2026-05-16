'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { Hub } from '@/domain/hub.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { HUB_FORM_ID, HubForm } from '../components/hub-form';

const OVERVIEW_PATH = '/app/admin/hubs';

export default function NewHubPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [sourceHub, setSourceHub] = useState<Hub | undefined>(undefined);
  const [isLoadingSource, setIsLoadingSource] = useState(false);

  const copyFrom = searchParams.get('copyFrom');

  useEffect(() => {
    if (!copyFrom) return;

    setIsLoadingSource(true);
    fetch(`/api/hubs/${copyFrom}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch hub');
        return res.json() as Promise<Hub>;
      })
      .then((hub) => {
        setSourceHub({ ...hub, id: null, createdAt: null, updatedAt: null });
      })
      .catch(() => {
        toast.error(tCommon('feedback.loadError'));
      })
      .finally(() => {
        setIsLoadingSource(false);
      });
  }, [copyFrom, tCommon]);

  const handleCreate = async (hub: Hub) => {
    setIsSaving(true);
    try {
      const response = await apiPost('/api/hubs', hub);

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
          <Button type="submit" form={HUB_FORM_ID} disabled={isSaving || isLoadingSource} variant="outline" size="sm">
            <Save className="size-3.5" />
            {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
          </Button>
        </div>
      </div>
      {!isLoadingSource && <HubForm formId={HUB_FORM_ID} isSubmitting={isSaving} onSubmit={handleCreate} initialHub={sourceHub} />}
    </div>
  );
}
