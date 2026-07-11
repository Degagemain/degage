'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { CarSticker } from '@/domain/car-sticker.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { CAR_STICKER_FORM_ID, CarStickerForm } from '../components/car-sticker-form';

export default function NewCarStickerPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (sticker: CarSticker) => {
    setIsSaving(true);
    try {
      const response = await apiPost('/api/car-stickers', sticker);

      if (!response.ok) {
        const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
        toast.error(message);
        return;
      }

      const created: CarSticker = await response.json();
      toast.success(tCommon('feedback.saveSuccess'));
      if (created.id) {
        router.push(`/app/admin/car-stickers/${created.id}`);
        return;
      }
      router.push('/app/admin/car-stickers');
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
          <Button type="submit" form={CAR_STICKER_FORM_ID} disabled={isSaving} variant="outline" size="sm">
            <Save className="size-3.5" />
            {isSaving ? tCommon('status.saving') : tCommon('actions.save')}
          </Button>
        </div>
      </div>
      <CarStickerForm formId={CAR_STICKER_FORM_ID} isSubmitting={isSaving} onSubmit={handleCreate} />
    </div>
  );
}
