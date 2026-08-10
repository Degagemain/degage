'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { carOnboardingCarNameSchema, getEarliestShareStartDate, getLatestShareStartDate, startOfMonth } from '@/domain/car-onboarding.model';
import { formatDateForInput, parseDateInput } from '@/app/components/form/date-input-helpers';
import { apiGet, apiPut } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { PublicField, PublicInfoPanel, PublicInput, PublicPanel } from '../public-ui';
import { StepActions } from '../step-actions';
import { StepLayout } from '../step-layout';
import { useCarOnboarding } from '../../lib/car-onboarding-context';
import styles from '../../car-onboarding-public.module.css';

type MonthCell = {
  date: Date;
  locked: boolean;
  earliest: boolean;
};

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const CAR_NAME_AVAILABILITY_DEBOUNCE_MS = 1000;

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

const sanitizeCarNameInput = (value: string): string => value.replace(/[^A-Za-z0-9]/g, '');

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
  const [carName, setCarName] = useState(() => carOnboarding.carName ?? '');
  const [availability, setAvailability] = useState<AvailabilityState>(() =>
    carOnboarding.carName && carOnboardingCarNameSchema.safeParse(carOnboarding.carName).success ? 'available' : 'idle',
  );
  const [isSaving, setIsSaving] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const date = parseDateInput(formatDateForInput(carOnboarding.shareStartDate));
    setSelected(date ? startOfMonth(date) : null);
  }, [carOnboarding.shareStartDate]);

  useEffect(() => {
    setCarName(carOnboarding.carName ?? '');
    if (carOnboarding.carName && carOnboardingCarNameSchema.safeParse(carOnboarding.carName).success) {
      setAvailability('available');
    }
  }, [carOnboarding.carName]);

  useEffect(() => {
    if (!carOnboarding.id) return;

    const parsed = carOnboardingCarNameSchema.safeParse(carName);
    if (!parsed.success) {
      setAvailability(carName.trim() === '' ? 'idle' : 'invalid');
      return;
    }

    if (carOnboarding.carName != null && carOnboarding.carName.toLowerCase() === parsed.data.toLowerCase()) {
      setAvailability('available');
      return;
    }

    setAvailability('checking');
    const requestId = ++requestIdRef.current;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await apiGet(
            `/api/car-onboardings/${carOnboarding.id}/car-name-availability?carName=${encodeURIComponent(parsed.data)}`,
          );
          if (requestId !== requestIdRef.current) return;
          if (!response.ok) {
            setAvailability('idle');
            return;
          }
          const body = (await response.json()) as { available?: boolean };
          if (requestId !== requestIdRef.current) return;
          setAvailability(body.available === true ? 'available' : 'taken');
        } catch {
          if (requestId !== requestIdRef.current) return;
          setAvailability('idle');
        }
      })();
    }, CAR_NAME_AVAILABILITY_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [carName, carOnboarding.carName, carOnboarding.id]);

  const handleSave = async (): Promise<boolean> => {
    if (!carOnboarding.id || selected == null) return false;
    const parsedName = carOnboardingCarNameSchema.safeParse(carName);
    if (!parsedName.success || availability === 'taken' || availability === 'checking') return false;

    setIsSaving(true);
    try {
      const iso = formatDateForInput(startOfMonth(selected));
      const response = await apiPut(`/api/car-onboardings/${carOnboarding.id}/share-start`, {
        shareStartDate: iso,
        carName: parsedName.data,
      });
      if (!response.ok) {
        const code = await response
          .clone()
          .json()
          .then((body: { code?: string }) => body.code)
          .catch(() => undefined);
        if (code === 'car_name_taken') {
          setAvailability('taken');
          toast.error(t('steps.shareStart.carNameTaken'));
          return false;
        }
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

  const canSave = !isSaving && selected != null && availability === 'available' && carOnboardingCarNameSchema.safeParse(carName).success;

  return (
    <StepLayout stepId="share-start">
      <PublicInfoPanel title={t('steps.shareStart.panelTitle')} body={t('steps.shareStart.panelBody')} />
      <PublicPanel>
        <PublicField
          label={t('steps.shareStart.carNameLabel')}
          hint={
            availability === 'invalid'
              ? t('steps.shareStart.carNameInvalid')
              : availability === 'taken'
                ? t('steps.shareStart.carNameTaken')
                : availability === 'checking'
                  ? t('steps.shareStart.carNameChecking')
                  : availability === 'available'
                    ? t('steps.shareStart.carNameAvailable')
                    : t('steps.shareStart.carNameHint')
          }
        >
          <PublicInput
            type="text"
            value={carName}
            autoComplete="off"
            maxLength={50}
            onChange={(e) => setCarName(sanitizeCarNameInput(e.target.value))}
          />
        </PublicField>
      </PublicPanel>
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
      <StepActions stepId="share-start" onSave={handleSave} saveDisabled={!canSave} />
    </StepLayout>
  );
}
