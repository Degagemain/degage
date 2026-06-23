'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import type { PlayInfosession } from '@/domain/play-infosession.model';
import { apiPut } from '@/app/lib/api-client';
import { formatInfosessionRegistrations, formatInfosessionScheduledAt } from '@/app/lib/play-infosession-format';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

export function InfoSessionStep() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, reload } = useCarOnboarding();
  const [infosessions, setInfosessions] = useState<PlayInfosession[] | null>(null);
  const [loadingInfosessions, setLoadingInfosessions] = useState(true);
  const [infosessionsError, setInfosessionsError] = useState(false);
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);

  const isEnrolled = carOnboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.ENROLLED;
  const isDone = carOnboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.DONE;
  const canPickSession = !isEnrolled && !isDone;

  const loadInfosessions = useCallback(async () => {
    setLoadingInfosessions(true);
    setInfosessionsError(false);
    try {
      const response = await fetch('/api/play-infosessions');
      if (!response.ok) {
        setInfosessionsError(true);
        setInfosessions(null);
        return;
      }
      const data = (await response.json()) as { infosessions: PlayInfosession[] };
      setInfosessions(data.infosessions);
    } catch {
      setInfosessionsError(true);
      setInfosessions(null);
    } finally {
      setLoadingInfosessions(false);
    }
  }, []);

  useEffect(() => {
    if (!canPickSession) {
      setLoadingInfosessions(false);
      setInfosessions(null);
      return;
    }
    void loadInfosessions();
  }, [canPickSession, loadInfosessions]);

  const handleEnroll = async (row: PlayInfosession) => {
    if (!carOnboarding.id || row.enrollId == null || !canPickSession) return;
    setActionSessionId(row.enrollId);
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/info-session/enroll`, {
        infoSessionDate: row.scheduledAt,
        infoSessionPcId: row.enrollId,
      });
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('steps.infoSession.enrollError')));
        return;
      }
      toast.success(t('steps.infoSession.enrollSuccess'));
      await reload();
    } catch {
      toast.error(t('steps.infoSession.enrollError'));
    } finally {
      setActionSessionId(null);
    }
  };

  const handleUnenroll = async () => {
    if (!carOnboarding.id) return;
    setActionSessionId('unenroll');
    try {
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/info-session/unenroll`);
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('steps.infoSession.unenrollError')));
        return;
      }
      toast.success(t('steps.infoSession.unenrollSuccess'));
      await reload();
      await loadInfosessions();
    } catch {
      toast.error(t('steps.infoSession.unenrollError'));
    } finally {
      setActionSessionId(null);
    }
  };

  return (
    <StepLayout stepId="info-session">
      <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{t('steps.infoSession.info')}</p>

      {isEnrolled || isDone ? (
        <div className={`${styles.enrollmentStatusCard}${isDone ? ` ${styles.enrollmentStatusCardDone}` : ''}`}>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            {isDone ? t('steps.infoSession.confirmedTitle') : t('steps.infoSession.enrolledTitle')}
          </p>
          {carOnboarding.infoSessionDate ? (
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{formatInfosessionScheduledAt(carOnboarding.infoSessionDate)}</p>
          ) : null}
          {isEnrolled ? (
            <>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{t('steps.infoSession.waitingForConfirmation')}</p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{t('steps.infoSession.unenrollToSwitch')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={actionSessionId != null}
                onClick={() => void handleUnenroll()}
              >
                {actionSessionId === 'unenroll' ? <Loader2 className="size-4 animate-spin" /> : t('steps.infoSession.unenroll')}
              </Button>
            </>
          ) : (
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{t('steps.infoSession.confirmed')}</p>
          )}
        </div>
      ) : null}

      {canPickSession && loadingInfosessions ? (
        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          <Loader2 className="size-4 animate-spin" />
          {t('steps.infoSession.loading')}
        </div>
      ) : canPickSession && infosessionsError ? (
        <p className="text-sm text-stone-600 dark:text-stone-400">{t('steps.infoSession.loadError')}</p>
      ) : canPickSession ? (
        <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50 dark:bg-stone-800/50 dark:hover:bg-stone-800/50">
                <TableHead>{t('steps.infoSession.columns.scheduledAt')}</TableHead>
                <TableHead>{t('steps.infoSession.columns.district')}</TableHead>
                <TableHead>{t('steps.infoSession.columns.type')}</TableHead>
                <TableHead>{t('steps.infoSession.columns.registrations')}</TableHead>
                <TableHead>{t('steps.infoSession.columns.host')}</TableHead>
                <TableHead className="w-[7rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {infosessions?.length ? (
                infosessions.map((row, index) => {
                  const isSelectedRow = carOnboarding.infoSessionPcId != null && row.enrollId === carOnboarding.infoSessionPcId;
                  const canEnroll = !isDone && !isEnrolled && row.enrollId != null && !row.isFull && actionSessionId == null;

                  return (
                    <TableRow
                      key={`${row.enrollId ?? String(row.scheduledAt)}-${index}`}
                      className={isSelectedRow ? 'bg-[var(--public-icon-bg)]/40' : undefined}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{formatInfosessionScheduledAt(row.scheduledAt)}</TableCell>
                      <TableCell>{row.district}</TableCell>
                      <TableCell className="min-w-[12rem]">{row.type}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatInfosessionRegistrations(row, t('steps.infoSession.registrationsFull'))}
                      </TableCell>
                      <TableCell>{row.host}</TableCell>
                      <TableCell>
                        {canEnroll ? (
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 rounded-lg bg-[var(--public-brand)] text-white hover:bg-[var(--public-brand-hover)]"
                            disabled={actionSessionId === row.enrollId}
                            onClick={() => void handleEnroll(row)}
                          >
                            {actionSessionId === row.enrollId ? <Loader2 className="size-4 animate-spin" /> : t('steps.infoSession.enroll')}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-8 text-center text-sm">
                    {t('steps.infoSession.tableEmpty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <StepActions stepId="info-session" showSave={false} />
    </StepLayout>
  );
}
