'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import type { PlayInfosession } from '@/domain/play-infosession.model';
import { apiPut } from '@/app/lib/api-client';
import { formatInfosessionRegistrations, formatInfosessionScheduledAt } from '@/app/lib/play-infosession-format';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { InlineCopy } from '@/app/components/inline-copy';
import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

import { PublicInfoPanel } from '../public-ui';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

type PlayInfosessionListResponse = {
  infosessions: PlayInfosession[];
  chosenInfosession: PlayInfosession | null;
};

function EnrolledSessionDetails({ session, t }: { session: PlayInfosession; t: ReturnType<typeof useTranslations> }) {
  return (
    <dl className="mt-3 space-y-2 text-sm text-stone-600">
      <div>
        <dt className="font-medium text-stone-900">{t('steps.infoSession.columns.scheduledAt')}</dt>
        <dd>{formatInfosessionScheduledAt(session.scheduledAt)}</dd>
      </div>
      {session.district ? (
        <div>
          <dt className="font-medium text-stone-900">{t('steps.infoSession.columns.district')}</dt>
          <dd>{session.district}</dd>
        </div>
      ) : null}
      {session.type ? (
        <div>
          <dt className="font-medium text-stone-900">{t('steps.infoSession.columns.type')}</dt>
          <dd>{session.type}</dd>
        </div>
      ) : null}
      {session.host ? (
        <div>
          <dt className="font-medium text-stone-900">{t('steps.infoSession.columns.host')}</dt>
          <dd>{session.host}</dd>
        </div>
      ) : null}
      <div>
        <dt className="font-medium text-stone-900">{t('steps.infoSession.columns.registrations')}</dt>
        <dd>{formatInfosessionRegistrations(session, t('steps.infoSession.registrationsFull'))}</dd>
      </div>
    </dl>
  );
}

export function InfoSessionStep() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, reload } = useCarOnboarding();
  const [infosessions, setInfosessions] = useState<PlayInfosession[] | null>(null);
  const [chosenInfosession, setChosenInfosession] = useState<PlayInfosession | null>(null);
  const [loadingInfosessions, setLoadingInfosessions] = useState(true);
  const [infosessionsError, setInfosessionsError] = useState(false);
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);

  const isEnrolled = carOnboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.ENROLLED;
  const isDone = carOnboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.DONE;
  const hasLocalEnrollment = carOnboarding.infoSessionPcId != null;
  const shouldLoadInfosessions = !isDone;

  const hasExternalPlayEnrollment = chosenInfosession != null && !hasLocalEnrollment && !isDone;
  const canPickSession = !isEnrolled && !isDone && !hasExternalPlayEnrollment;

  const enrolledSession = useMemo(() => {
    if (chosenInfosession != null) {
      return chosenInfosession;
    }
    if (carOnboarding.infoSessionPcId != null) {
      return infosessions?.find((row) => row.enrollId === carOnboarding.infoSessionPcId) ?? null;
    }
    return null;
  }, [carOnboarding.infoSessionPcId, chosenInfosession, infosessions]);

  const loadInfosessions = useCallback(async () => {
    setLoadingInfosessions(true);
    setInfosessionsError(false);
    try {
      const response = await fetch('/api/play-infosessions');
      if (!response.ok) {
        setInfosessionsError(true);
        setInfosessions(null);
        setChosenInfosession(null);
        return;
      }
      const data = (await response.json()) as PlayInfosessionListResponse;
      setInfosessions(data.infosessions);
      setChosenInfosession(data.chosenInfosession);
    } catch {
      setInfosessionsError(true);
      setInfosessions(null);
      setChosenInfosession(null);
    } finally {
      setLoadingInfosessions(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadInfosessions) {
      setLoadingInfosessions(false);
      setInfosessions(null);
      setChosenInfosession(null);
      return;
    }
    void loadInfosessions();
  }, [shouldLoadInfosessions, loadInfosessions]);

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

  const handlePlayUnenroll = async () => {
    setActionSessionId('play-unenroll');
    try {
      const response = await apiPut('/api/play-infosessions/unenroll');
      if (!response.ok) {
        toast.error(await parseApiErrorMessage(response, t('steps.infoSession.unenrollError')));
        return;
      }
      toast.success(t('steps.infoSession.unenrollSuccess'));
      await loadInfosessions();
    } catch {
      toast.error(t('steps.infoSession.unenrollError'));
    } finally {
      setActionSessionId(null);
    }
  };

  return (
    <StepLayout stepId="info-session">
      <PublicInfoPanel title={t('steps.infoSession.panelTitle')} body={t('steps.infoSession.panelBody')} />

      {hasExternalPlayEnrollment && chosenInfosession ? (
        <div className={`${styles.enrollmentStatusCard} mb-6 border-amber-200 bg-amber-50`}>
          <p className="text-sm font-medium text-stone-900">{t('steps.infoSession.externalEnrollmentTitle')}</p>
          <p className="mt-2 text-sm text-stone-600">
            <InlineCopy>{t('steps.infoSession.externalEnrollmentWarning')}</InlineCopy>
          </p>
          <EnrolledSessionDetails session={chosenInfosession} t={t} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={actionSessionId != null}
            onClick={() => void handlePlayUnenroll()}
          >
            {actionSessionId === 'play-unenroll' ? <Loader2 className="size-4 animate-spin" /> : t('steps.infoSession.unenroll')}
          </Button>
        </div>
      ) : null}

      {isEnrolled || isDone ? (
        <div className={`${styles.enrollmentStatusCard}${isDone ? ` ${styles.enrollmentStatusCardDone}` : ''}`}>
          <p className="text-sm font-medium text-stone-900">
            {isDone ? t('steps.infoSession.confirmedTitle') : t('steps.infoSession.enrolledTitle')}
          </p>
          {enrolledSession ? (
            <EnrolledSessionDetails session={enrolledSession} t={t} />
          ) : carOnboarding.infoSessionDate ? (
            <p className="mt-1 text-sm text-stone-600">{formatInfosessionScheduledAt(carOnboarding.infoSessionDate)}</p>
          ) : loadingInfosessions ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-stone-600">
              <Loader2 className="size-4 animate-spin" />
              {t('steps.infoSession.loading')}
            </div>
          ) : null}
          {isEnrolled ? (
            <>
              <p className="mt-2 text-sm text-stone-600">
                <InlineCopy>{t('steps.infoSession.waitingForConfirmation')}</InlineCopy>
              </p>
              <p className="mt-2 text-sm text-stone-600">
                <InlineCopy>{t('steps.infoSession.unenrollToSwitch')}</InlineCopy>
              </p>
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
            <p className="mt-2 text-sm text-stone-600">
              <InlineCopy>{t('steps.infoSession.confirmed')}</InlineCopy>
            </p>
          )}
        </div>
      ) : null}

      {canPickSession && loadingInfosessions ? (
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Loader2 className="size-4 animate-spin" />
          {t('steps.infoSession.loading')}
        </div>
      ) : canPickSession && infosessionsError ? (
        <p className="text-sm text-stone-600">
          <InlineCopy>{t('steps.infoSession.loadError')}</InlineCopy>
        </p>
      ) : canPickSession ? (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-stone-50 hover:bg-stone-50">
                <TableHead className="w-[7rem]" />
                <TableHead>{t('steps.infoSession.columns.scheduledAt')}</TableHead>
                <TableHead>{t('steps.infoSession.columns.district')}</TableHead>
                <TableHead>{t('steps.infoSession.columns.registrations')}</TableHead>
                <TableHead>{t('steps.infoSession.columns.host')}</TableHead>
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
                      <TableCell className="font-medium whitespace-nowrap">{formatInfosessionScheduledAt(row.scheduledAt)}</TableCell>
                      <TableCell>{row.district}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatInfosessionRegistrations(row, t('steps.infoSession.registrationsFull'))}
                      </TableCell>
                      <TableCell>{row.host}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-8 text-center text-sm">
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
