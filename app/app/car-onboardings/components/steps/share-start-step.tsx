'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getEarliestShareStartDate, getLatestShareStartDate, startOfMonth } from '@/domain/car-onboarding.model';
import { formatDateForInput, parseDateInput } from '@/app/components/form/date-input-helpers';
import { apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicInfoPanel, PublicPanel } from '../public-ui';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

type MonthCell = {
  date: Date;
  locked: boolean;
  earliest: boolean;
};

const monthKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}`;

const buildMonthCells = (earliest: Date, latest: Date): MonthCell[] => {
  const lockedLead = 2;
  const start = new Date(earliest.getFullYear(), earliest.getMonth() - lockedLead, 1);
  const cells: MonthCell[] = [];
  for (let cursor = start; cursor.getTime() <= latest.getTime(); cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)) {
    const isEarliest = monthKey(cursor) === monthKey(earliest);
    const locked = cursor.getTime() < earliest.getTime();
    cells.push({ date: new Date(cursor), locked, earliest: isEarliest });
  }
  return cells;
};

const formatMonthShort = (date: Date, locale: string): string => date.toLocaleDateString(locale, { month: 'short' }).replace(/\.$/, '');

const formatYearShort = (date: Date): string => String(date.getFullYear()).slice(2);

const formatShareStartLabel = (date: Date, locale: string): string =>
  date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

export function ShareStartStep() {
  const t = useTranslations('carOnboardingPublic');
  const locale = useLocale();
  const { carOnboarding, reload } = useCarOnboarding();

  const earliest = useMemo(() => getEarliestShareStartDate(carOnboarding), [carOnboarding]);
  const latest = useMemo(() => getLatestShareStartDate(), []);
  const months = useMemo(() => buildMonthCells(earliest, latest), [earliest, latest]);

  const [selected, setSelected] = useState<Date | null>(() => {
    const date = parseDateInput(formatDateForInput(carOnboarding.shareStartDate));
    return date ? startOfMonth(date) : null;
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const date = parseDateInput(formatDateForInput(carOnboarding.shareStartDate));
    setSelected(date ? startOfMonth(date) : null);
  }, [carOnboarding.shareStartDate]);

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id || selected == null) return false;
    setIsSaving(true);
    try {
      const iso = formatDateForInput(startOfMonth(selected));
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/share-start`, {
        shareStartDate: iso,
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
    <StepLayout stepId="share-start">
      <PublicInfoPanel title={t('steps.shareStart.panelTitle')} body={t('steps.shareStart.panelBody')} />
      <PublicPanel>
        <div className={styles.shareStartLegend}>
          <span>{t('steps.shareStart.legendLocked')}</span>
          <span>{t('steps.shareStart.legendAvailable')}</span>
        </div>
        <div className={styles.shareStartTimeline} role="listbox" aria-label={t('steps.shareStart.title')}>
          {months.map((cell) => {
            const isSelected = selected != null && monthKey(selected) === monthKey(cell.date);
            const className = [
              styles.shareStartMonth,
              cell.locked ? styles.shareStartMonthLocked : '',
              cell.earliest ? styles.shareStartMonthEarliest : '',
              isSelected ? styles.shareStartMonthSelected : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={monthKey(cell.date)}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={cell.locked}
                disabled={cell.locked}
                className={className}
                onClick={() => {
                  if (!cell.locked) setSelected(cell.date);
                }}
              >
                {cell.earliest ? <span className={styles.shareStartEarliestBadge}>{t('steps.shareStart.earliestBadge')}</span> : null}
                <span className={styles.shareStartMonthLabel}>{formatMonthShort(cell.date, locale)}</span>
                <span className={styles.shareStartYearLabel}>&apos;{formatYearShort(cell.date)}</span>
              </button>
            );
          })}
        </div>
        <p className={styles.shareStartHelper}>
          {carOnboarding.hasInsuranceContract
            ? t('steps.shareStart.helperWithInsurance', { date: formatShareStartLabel(earliest, locale) })
            : t('steps.shareStart.helperWithoutInsurance', { date: formatShareStartLabel(earliest, locale) })}
        </p>
        {selected != null ? (
          <div className={styles.shareStartSummary}>
            <div className={styles.shareStartSummaryLabel}>{formatShareStartLabel(selected, locale)}</div>
            <div className={styles.shareStartSummaryHint}>{t('steps.shareStart.selectedHint')}</div>
          </div>
        ) : null}
      </PublicPanel>
      <StepActions stepId="share-start" onSave={handleSave} saveDisabled={isSaving || selected == null} />
    </StepLayout>
  );
}
