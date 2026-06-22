'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Link2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import type { PlayConnectorStatus } from '@/domain/play-connector.model';
import type { PlayInfosession } from '@/domain/play-infosession.model';

const sectionCardClassName = 'rounded-xl border border-stone-200/80 bg-white p-6 shadow-none dark:border-stone-700/80 dark:bg-stone-900';

const SETTINGS_PLAY_CONNECTOR_URL = '/app/account/settings?tab=play-connector';
const INFOSSESSION_PREVIEW_COUNT = 10;

const formatInfosessionScheduledAt = (value: Date | string): string =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const formatInfosessionRegistrations = (
  row: Pick<PlayInfosession, 'enrolled' | 'maxRegistrations' | 'isFull'>,
  fullLabel: string,
): string => {
  if (row.isFull) return fullLabel;
  return row.maxRegistrations != null ? `${row.enrolled} / ${row.maxRegistrations}` : String(row.enrolled);
};

export function DashboardPlayConnectorSection() {
  const t = useTranslations('dashboard.playConnector');
  const [connectorStatus, setConnectorStatus] = useState<PlayConnectorStatus | null>(null);
  const [infosessions, setInfosessions] = useState<PlayInfosession[] | null>(null);
  const [loadingConnector, setLoadingConnector] = useState(true);
  const [loadingInfosessions, setLoadingInfosessions] = useState(false);
  const [infosessionsError, setInfosessionsError] = useState(false);
  const [showAllInfosessions, setShowAllInfosessions] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingConnector(true);
      setInfosessionsError(false);
      setInfosessions(null);

      try {
        const statusResponse = await fetch('/api/play-connector');
        if (!statusResponse.ok) {
          return;
        }

        const status = (await statusResponse.json()) as PlayConnectorStatus;
        if (cancelled) return;

        setConnectorStatus(status);

        if (status.status !== 'success') {
          return;
        }

        setLoadingInfosessions(true);
        const infosessionsResponse = await fetch('/api/play-infosessions');
        if (cancelled) return;

        if (!infosessionsResponse.ok) {
          setInfosessionsError(true);
          return;
        }

        const data = (await infosessionsResponse.json()) as { infosessions: PlayInfosession[] };
        setInfosessions(data.infosessions);
        setShowAllInfosessions(false);
      } finally {
        if (!cancelled) {
          setLoadingConnector(false);
          setLoadingInfosessions(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadingConnector) {
    return (
      <section className="mt-10">
        <div className={`${sectionCardClassName} animate-pulse`}>
          <div className="bg-muted h-6 w-48 rounded" />
          <div className="bg-muted mt-4 h-16 rounded" />
        </div>
      </section>
    );
  }

  if (!connectorStatus || connectorStatus.status === 'missing') {
    return (
      <section className="mt-10">
        <article className={sectionCardClassName}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--public-icon-bg)] text-[var(--public-accent-strong)]"
                aria-hidden
              >
                <Link2 className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">{t('setupTitle')}</h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{t('setupDescription')}</p>
              </div>
            </div>
            <Button className="h-11 shrink-0 rounded-lg bg-[var(--public-brand)] px-6 text-white hover:bg-[var(--public-brand-hover)]" asChild>
              <Link href={SETTINGS_PLAY_CONNECTOR_URL}>{t('setupCta')}</Link>
            </Button>
          </div>
        </article>
      </section>
    );
  }

  if (connectorStatus.status === 'failing') {
    return (
      <section className="mt-10">
        <article className={sectionCardClassName}>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">{t('sectionTitle')}</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{t('failingDescription')}</p>
          <Button
            variant="outline"
            className="mt-4 h-11 rounded-lg border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
            asChild
          >
            <Link href={SETTINGS_PLAY_CONNECTOR_URL}>{t('setupCta')}</Link>
          </Button>
        </article>
      </section>
    );
  }

  const visibleInfosessions = infosessions && !showAllInfosessions ? infosessions.slice(0, INFOSSESSION_PREVIEW_COUNT) : infosessions;
  const hasMoreInfosessions = (infosessions?.length ?? 0) > INFOSSESSION_PREVIEW_COUNT;

  return (
    <section className="mt-10">
      <article className={sectionCardClassName}>
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--public-icon-bg)] text-[var(--public-accent-strong)]"
            aria-hidden
          >
            <CalendarDays className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">{t('sectionTitle')}</h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{t('sectionDescription')}</p>
          </div>
        </div>

        {loadingInfosessions ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
            <Loader2 className="size-4 animate-spin" />
            {t('loadingInfosessions')}
          </div>
        ) : infosessionsError ? (
          <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">{t('loadError')}</p>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50 hover:bg-stone-50 dark:bg-stone-800/50 dark:hover:bg-stone-800/50">
                    <TableHead>{t('columns.scheduledAt')}</TableHead>
                    <TableHead>{t('columns.district')}</TableHead>
                    <TableHead>{t('columns.type')}</TableHead>
                    <TableHead>{t('columns.registrations')}</TableHead>
                    <TableHead>{t('columns.host')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleInfosessions?.length ? (
                    visibleInfosessions.map((row, index) => (
                      <TableRow key={`${row.enrollId ?? String(row.scheduledAt)}-${index}`}>
                        <TableCell className="font-medium whitespace-nowrap">{formatInfosessionScheduledAt(row.scheduledAt)}</TableCell>
                        <TableCell>{row.district}</TableCell>
                        <TableCell className="min-w-[12rem]">{row.type}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatInfosessionRegistrations(row, t('registrationsFull'))}</TableCell>
                        <TableCell>{row.host}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground py-8 text-center text-sm">
                        {t('tableEmpty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {hasMoreInfosessions && !showAllInfosessions ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
                onClick={() => setShowAllInfosessions(true)}
              >
                {t('showMore', { count: (infosessions?.length ?? 0) - INFOSSESSION_PREVIEW_COUNT })}
              </Button>
            ) : null}
          </div>
        )}
      </article>
    </section>
  );
}
