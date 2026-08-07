'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import type { CarSticker } from '@/domain/car-sticker.model';
import type { Page } from '@/domain/page.model';
import { MaxTake } from '@/domain/utils';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicPanel } from '../public-ui';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

type StickerWithImageUrl = CarSticker & {
  imageUrl: string | null;
};

export function CarStickersStep() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, reload } = useCarOnboarding();
  const [stickers, setStickers] = useState<StickerWithImageUrl[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedExtraIds(carOnboarding.carStickers.map((sticker) => sticker.id));
  }, [carOnboarding]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const params = new URLSearchParams({ take: String(MaxTake), skip: '0' });
        const response = await fetch(`/api/car-stickers?${params.toString()}`);
        if (!response.ok) {
          if (!cancelled) setLoadError(true);
          return;
        }

        const data = (await response.json()) as Page<CarSticker>;
        const activeStickers = (data.records ?? []).filter((sticker) => sticker.isActive && sticker.id != null);

        const withImageUrls = await Promise.all(
          activeStickers.map(async (sticker) => {
            if (!sticker.image?.id) {
              return { ...sticker, imageUrl: null };
            }

            try {
              const imageResponse = await fetch(`/api/car-stickers/${sticker.id}/image/view-url`);
              if (!imageResponse.ok) {
                return { ...sticker, imageUrl: null };
              }
              const imageData = (await imageResponse.json()) as { url?: string };
              return { ...sticker, imageUrl: imageData.url ?? null };
            } catch {
              return { ...sticker, imageUrl: null };
            }
          }),
        );

        if (!cancelled) {
          setStickers(withImageUrls);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const alwaysIncludedIds = useMemo(
    () => new Set(stickers.filter((sticker) => sticker.isAlwaysIncluded).map((sticker) => sticker.id!)),
    [stickers],
  );

  const toggleExtraSticker = (stickerId: string) => {
    setSelectedExtraIds((current) => (current.includes(stickerId) ? current.filter((id) => id !== stickerId) : [...current, stickerId]));
  };

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id) return false;
    setIsSaving(true);
    try {
      const selectedStickers = stickers
        .filter((sticker) => sticker.id != null && selectedExtraIds.includes(sticker.id))
        .map((sticker) => ({ id: sticker.id!, name: sticker.name }));

      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/car-stickers`, {
        carStickers: selectedStickers,
      });
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('errors.save')));
        return false;
      }
      toast.success(t('saveSuccess'));
      await reload();
      return true;
    } catch {
      toast.error(t('errors.save'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StepLayout stepId="car-stickers">
      <PublicPanel title={t('steps.carStickers.panelTitle')} body={t('steps.carStickers.helper')}>
        {loading ? <p className={styles.panelBody}>{t('steps.carStickers.loading')}</p> : null}
        {loadError ? <p className={styles.panelBody}>{t('steps.carStickers.loadError')}</p> : null}
        {!loading && !loadError ? (
          <div className={styles.stickerGrid}>
            {stickers.map((sticker) => {
              const stickerId = sticker.id!;
              const isAlwaysIncluded = alwaysIncludedIds.has(stickerId);
              const isSelected = isAlwaysIncluded || selectedExtraIds.includes(stickerId);

              return (
                <label
                  key={stickerId}
                  className={`${styles.stickerCard} ${isSelected ? styles.stickerCardSelected : ''} ${isAlwaysIncluded ? styles.stickerCardLocked : ''}`}
                >
                  <input
                    type="checkbox"
                    className={styles.stickerCheckbox}
                    checked={isSelected}
                    disabled={isAlwaysIncluded}
                    onChange={() => toggleExtraSticker(stickerId)}
                  />
                  <div className={styles.stickerImageFrame}>
                    {sticker.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sticker.imageUrl} alt={sticker.name} className={styles.stickerImage} />
                    ) : (
                      <div className={styles.stickerImagePlaceholder} />
                    )}
                  </div>
                  <span className={styles.stickerLabel}>{sticker.name}</span>
                  {isAlwaysIncluded ? <span className={styles.stickerAlwaysIncluded}>{t('steps.carStickers.alwaysIncluded')}</span> : null}
                </label>
              );
            })}
          </div>
        ) : null}
      </PublicPanel>
      <StepActions stepId="car-stickers" onSave={handleSave} saveDisabled={isSaving} />
    </StepLayout>
  );
}
