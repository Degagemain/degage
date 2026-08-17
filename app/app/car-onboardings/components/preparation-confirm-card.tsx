'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { InlineCopy } from '@/app/components/inline-copy';
import { isPreparationConfirmable, isPreparationConfirmed } from '@/domain/car-onboarding.model';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { cn } from '@/app/lib/utils';

import { useCarOnboarding } from '../lib/car-onboarding-context';
import { PublicBtn, PublicInput } from './public-ui';
import styles from '../car-onboarding-public.module.css';

export function PreparationConfirmCard() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, reload } = useCarOnboarding();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmed = isPreparationConfirmed(carOnboarding);
  const confirmable = isPreparationConfirmable(carOnboarding);
  const blocked = !confirmed && !confirmable;

  const handleDialogOpenChange = (open: boolean) => {
    if (isConfirming) return;
    setDialogOpen(open);
    if (!open) setAcknowledged(false);
  };

  const handleConfirm = async () => {
    if (!carOnboarding.id || !acknowledged) return;
    setIsConfirming(true);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/confirm-preparation`);
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('confirmInfo.confirmError')));
        return;
      }
      toast.success(t('confirmInfo.confirmSuccess'));
      setDialogOpen(false);
      setAcknowledged(false);
      await reload();
    } catch {
      toast.error(t('confirmInfo.confirmError'));
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          styles.confirmCard,
          blocked && styles.confirmCardDisabled,
          confirmed && styles.confirmCardDone,
          confirmable && styles.confirmCardReady,
        )}
      >
        <div className={styles.confirmCardBody}>
          <h3 className={styles.confirmCardTitle}>{t('confirmInfo.title')}</h3>
          <p className={styles.confirmCardSubtitle}>
            <InlineCopy>{confirmed ? t('confirmInfo.confirmedSubtitle') : t('confirmInfo.subtitle')}</InlineCopy>
          </p>
        </div>
        <div className={styles.confirmCardActions}>
          {confirmed ? (
            <span className={cn(styles.stepMark, styles.stepMarkDone)} title={t('states.done')} aria-label={t('states.done')}>
              ✓
            </span>
          ) : blocked ? (
            <span className={styles.stepMarkLocked} title={t('states.blocked')} aria-label={t('states.blocked')}>
              <Lock aria-hidden />
            </span>
          ) : (
            <PublicBtn type="button" small onClick={() => setDialogOpen(true)}>
              {t('confirmInfo.button')}
            </PublicBtn>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent showCloseButton={false} className={cn(styles.root, styles.confirmDialog)} overlayClassName={styles.confirmDialogOverlay}>
          <DialogHeader className={styles.confirmDialogHeader}>
            <DialogTitle className={styles.confirmDialogTitle}>{t('confirmInfo.dialogTitle')}</DialogTitle>
            <DialogDescription className={styles.confirmDialogDescription}>
              <InlineCopy>{t('confirmInfo.dialogDescription')}</InlineCopy>
            </DialogDescription>
          </DialogHeader>

          <label className={styles.checkboxLabel}>
            <PublicInput type="checkbox" checked={acknowledged} disabled={isConfirming} onChange={(e) => setAcknowledged(e.target.checked)} />
            <span>{t('confirmInfo.checkboxLabel')}</span>
          </label>

          <DialogFooter className={styles.confirmDialogFooter}>
            <PublicBtn type="button" variant="secondary" small onClick={() => handleDialogOpenChange(false)} disabled={isConfirming}>
              {t('confirmInfo.cancel')}
            </PublicBtn>
            <PublicBtn type="button" small onClick={() => void handleConfirm()} disabled={isConfirming || !acknowledged}>
              {isConfirming ? t('confirmInfo.confirming') : t('confirmInfo.confirm')}
            </PublicBtn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
