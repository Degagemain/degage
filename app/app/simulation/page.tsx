'use client';
import { capture } from '@/app/lib/posthog';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { FaqByTags, type FaqPanelClassNames } from '@/app/components/documentation/faq-by-tags';
import { SimulationResultCode } from '@/domain/simulation.model';
import type { DocumentationTag } from '@/domain/documentation.model';
import { calculateOwnerKmPerYear } from '@/domain/utils';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { cn } from '@/app/lib/utils';
import { SearchDropdown } from './components/search-dropdown';
import styles from './simulation.module.css';

const SIM_FAQ_PANEL: Partial<FaqPanelClassNames> = {
  panel: styles.faqPanel,
  headerButton: styles.faqPanelHeaderBtn,
  headerRight: styles.faqPanelHeaderRight,
  title: styles.faqPanelTitle,
  countBadge: styles.faqPanelCount,
  sectionChevron: styles.faqPanelSectionChevron,
  item: styles.faqPanelItem,
  itemTrigger: styles.faqPanelQBtn,
  questionText: styles.faqPanelQText,
  questionChevron: styles.faqPanelQChevron,
  itemContent: styles.faqPanelAnswer,
};

const STEP_SITUATION = 1;
const STEP_CAR_INFO = 2;
const STEP_LOADING = 3;
const STEP_RESULT = 4;
const STEP_COST_SCENARIOS = 5;
const STEP_CONFIRMATION = 6;

const NUMBERED_STEP_TOTAL = 4;

const COST_SCENARIO_PEOPLE_BY_INDEX = [8, 14, 20] as const;

const CAR_TYPE_OTHER = '__other__';

type CarChoice = 'existing' | 'newCar';

type ConfirmationMemberPath = 'infosessie' | 'lid' | 'nieuw';

type ConfirmationStepDef = {
  n: number;
  labelKey: string;
  metaKey: string;
  cta?: boolean;
};

const CONFIRMATION_STEPS_BY_PATH: Record<ConfirmationMemberPath, ConfirmationStepDef[]> = {
  infosessie: [
    { n: 1, labelKey: 'insStep1Label', metaKey: 'insStep1Meta' },
    { n: 2, labelKey: 'insStep2Label', metaKey: 'insStep2Meta' },
    { n: 3, labelKey: 'insStep3Label', metaKey: 'insStep3Meta' },
    { n: 4, labelKey: 'insStep4Label', metaKey: 'insStep4Meta' },
  ],
  lid: [
    { n: 1, labelKey: 'lidStep1Label', metaKey: 'lidStep1Meta', cta: true },
    { n: 2, labelKey: 'lidStep2Label', metaKey: 'lidStep2Meta' },
    { n: 3, labelKey: 'lidStep3Label', metaKey: 'lidStep3Meta' },
    { n: 4, labelKey: 'lidStep4Label', metaKey: 'lidStep4Meta' },
    { n: 5, labelKey: 'lidStep5Label', metaKey: 'lidStep5Meta' },
  ],
  nieuw: [
    { n: 1, labelKey: 'newStep1Label', metaKey: 'newStep1Meta' },
    { n: 2, labelKey: 'newStep2Label', metaKey: 'newStep2Meta', cta: true },
    { n: 3, labelKey: 'newStep3Label', metaKey: 'newStep3Meta' },
    { n: 4, labelKey: 'newStep4Label', metaKey: 'newStep4Meta' },
    { n: 5, labelKey: 'newStep5Label', metaKey: 'newStep5Meta' },
    { n: 6, labelKey: 'newStep6Label', metaKey: 'newStep6Meta' },
  ],
};

const CONFIRMATION_PATH_OPTIONS: { id: ConfirmationMemberPath; labelKey: string }[] = [
  { id: 'infosessie', labelKey: 'pathInfosessie' },
  { id: 'lid', labelKey: 'pathLid' },
  { id: 'nieuw', labelKey: 'pathNieuw' },
];

const DEV_UI_ENABLED = process.env.NEXT_PUBLIC_DEV_UI === 'true';

/** Visual max duration for the public loading bar (seconds); the result screen shows as soon as the API responds. */
const SIMULATION_LOADING_BAR_SECONDS = 60;

const SIMULATION_FAQ_TAGS = {
  step1: ['simulation_step_1'],
  step2Approved: ['simulation_step_2_approved'],
  step2Rejected: ['simulation_step_2_rejected'],
  step2Review: ['simulation_step_2_review'],
  step3: ['simulation_step_3'],
  step4: ['simulation_step_4'],
} as const satisfies Record<string, DocumentationTag[]>;

export default function SimulationPage() {
  const t = useTranslations('simulationPublic');
  const tWizard = useTranslations('simulation.wizard');
  const [screen, setScreen] = useState(1);
  const [carChoice, setCarChoice] = useState<CarChoice | null>(null);

  const [townId, setTownId] = useState('');
  const [townLabel, setTownLabel] = useState('');
  const [brandId, setBrandId] = useState('');
  const [brandLabel, setBrandLabel] = useState('');
  const [fuelTypeId, setFuelTypeId] = useState('');
  const [fuelTypeName, setFuelTypeName] = useState('');
  const [carTypeId, setCarTypeId] = useState('');
  const [carTypeName, setCarTypeName] = useState('');
  const [carTypeOther, setCarTypeOther] = useState('');
  const [seats, setSeats] = useState('5');
  const [isVan, setIsVan] = useState(false);
  const [mileage, setMileage] = useState('');
  const [firstRegisteredAt, setFirstRegisteredAt] = useState('');
  const [ownerKmPerYear, setOwnerKmPerYear] = useState('');
  const [ownerKmManuallyEdited, setOwnerKmManuallyEdited] = useState(false);
  const [purchaseAmountInclVat, setPurchaseAmountInclVat] = useState('');

  const [fuelTypes, setFuelTypes] = useState<{ id: string; name: string }[]>([]);
  const [fuelTypesLoading, setFuelTypesLoading] = useState(true);
  const [fillExampleLoading, setFillExampleLoading] = useState(false);

  const [simulationResult, setSimulationResult] = useState<{
    resultCode: SimulationResultCode;
    message?: string;
    resultInsuranceCostPerYear?: number | null;
    resultTaxCostPerYear?: number | null;
    resultInspectionCostPerYear?: number | null;
    resultMaintenanceCostPerYear?: number | null;
    ownerKmPerYear?: number;
    resultBenchmarkMinKm?: number | null;
    resultBenchmarkAvgKm?: number | null;
    resultBenchmarkMaxKm?: number | null;
    resultEstimatedCarValue?: number | null;
    resultRoundedKmCost?: number | null;
    resultDepreciationCostKm?: number | null;
  } | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(0);
  const [resultHeroAutoState, setResultHeroAutoState] = useState<'parked' | 'driving' | 'gone'>('parked');
  const [resultDisplayOverride, setResultDisplayOverride] = useState<null | 'success' | 'notOk' | 'unclear'>(null);
  const [costScenarioIndex, setCostScenarioIndex] = useState(1);
  const [costDetailOpen, setCostDetailOpen] = useState(false);
  const [costScenarioPeopleDisplayed, setCostScenarioPeopleDisplayed] = useState(14);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmationMemberPath, setConfirmationMemberPath] = useState<ConfirmationMemberPath | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const simulationRequestInFlight = useRef(false);
  const prevScreenRef = useRef(screen);

  const isConfirmationValid = confirmationEmail.trim().length > 0 && confirmationEmail.trim().includes('@') && confirmationMemberPath !== null;

  const confirmationSteps = useMemo(
    () => (confirmationMemberPath ? CONFIRMATION_STEPS_BY_PATH[confirmationMemberPath] : []),
    [confirmationMemberPath],
  );

  useEffect(() => {
    if (prevScreenRef.current === STEP_CONFIRMATION && screen !== STEP_CONFIRMATION) {
      setConfirmationSent(false);
      setConfirmationMemberPath(null);
    }
    prevScreenRef.current = screen;
  }, [screen]);

  const isSuccessResult =
    simulationResult &&
    (simulationResult.resultCode === SimulationResultCode.CATEGORY_A ||
      simulationResult.resultCode === SimulationResultCode.CATEGORY_B ||
      simulationResult.resultCode === SimulationResultCode.HIGHER_RATE);
  const isNotOkResult = simulationResult && simulationResult.resultCode === SimulationResultCode.NOT_OK;
  const isUnclearResult = simulationResult && simulationResult.resultCode === SimulationResultCode.MANUAL_REVIEW;

  const displaySuccess = resultDisplayOverride === 'success' || (!resultDisplayOverride && !!isSuccessResult);
  const displayNotOk = resultDisplayOverride === 'notOk' || (!resultDisplayOverride && !!isNotOkResult);
  const displayUnclear = resultDisplayOverride === 'unclear' || (!resultDisplayOverride && !!isUnclearResult);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/fuel-types?isActive=true');
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setFuelTypes((data.records ?? []).map((r: { id: string; name: string }) => ({ id: r.id, name: r.name })));
        }
      } finally {
        if (!cancelled) setFuelTypesLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function firstRegistrationDateToDate(value: string): Date | undefined {
    if (!value.trim()) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const computedOwnerKmPerYear = useMemo(() => {
    const mileageNum = mileage.trim() ? parseInt(mileage.trim(), 10) : NaN;
    const date = firstRegistrationDateToDate(firstRegisteredAt);
    if (!Number.isInteger(mileageNum) || mileageNum < 0 || !date) return null;
    return calculateOwnerKmPerYear(mileageNum, date);
  }, [mileage, firstRegisteredAt]);

  useEffect(() => {
    if (ownerKmManuallyEdited) return;
    setOwnerKmPerYear(computedOwnerKmPerYear != null ? String(computedOwnerKmPerYear) : '');
  }, [computedOwnerKmPerYear, ownerKmManuallyEdited]);

  const effectiveOwnerKmPerYear = useMemo(() => {
    if (ownerKmPerYear.trim()) {
      const n = parseInt(ownerKmPerYear.trim(), 10);
      return Number.isInteger(n) && n >= 0 ? n : null;
    }
    return computedOwnerKmPerYear;
  }, [ownerKmPerYear, computedOwnerKmPerYear]);

  const ownerKmEditable = carChoice === 'newCar' || ownerKmManuallyEdited;

  const carTypeQueryParams = useMemo(
    () => (brandId && fuelTypeId ? { brandId, fuelTypeId, isActive: 'true' } : undefined),
    [brandId, fuelTypeId],
  );

  async function fillCarInfoExample() {
    setFillExampleLoading(true);
    setCarChoice('existing');
    try {
      const [townsRes, brandsRes] = await Promise.all([
        fetch('/api/towns?query=9030&take=10'),
        fetch('/api/car-brands?query=Renault&isActive=true&take=10'),
      ]);
      if (!townsRes.ok || !brandsRes.ok) return;
      const townsData = await townsRes.json();
      const brandsData = await brandsRes.json();
      const towns = townsData.records ?? [];
      const brands = brandsData.records ?? [];
      const town =
        towns.find((r: { zip?: string; displayLabel?: string }) => r.zip === '9030' || (r.displayLabel ?? '').startsWith('9030')) ?? towns[0];
      const brand = brands.find((r: { name?: string }) => (r.name ?? '').toLowerCase().includes('renault')) ?? brands[0];
      if (!town || !brand) return;
      const displayLabel = town.displayLabel ?? `${town.zip ?? ''} ${town.name ?? ''}`.trim();
      setTownId(town.id);
      setTownLabel(displayLabel);
      setBrandId(brand.id);
      setBrandLabel(brand.name ?? 'Renault');
      let fuelList = fuelTypes.length ? fuelTypes : [];
      if (fuelList.length === 0) {
        const fuelRes = await fetch('/api/fuel-types?isActive=true');
        if (!fuelRes.ok) return;
        const fuelData = await fuelRes.json();
        fuelList = (fuelData.records ?? []).map((r: { id: string; name: string }) => ({ id: r.id, name: r.name }));
      }
      const fuel = fuelList.find((f) => (f.name ?? '').toLowerCase().includes('diesel')) ?? fuelList[0];
      if (!fuel) return;
      setFuelTypeId(fuel.id);
      setFuelTypeName(fuel.name);
      const typesRes = await fetch(
        `/api/car-types?brandId=${encodeURIComponent(brand.id)}&fuelTypeId=${encodeURIComponent(fuel.id)}&query=TRAFIC&isActive=true&take=20`,
      );
      if (!typesRes.ok) return;
      const typesData = await typesRes.json();
      const types = typesData.records ?? [];
      const trafic = types.find((r: { name?: string }) => (r.name ?? '').toUpperCase().includes('TRAFIC')) ?? types[0];
      if (trafic) {
        setCarTypeId(trafic.id);
        setCarTypeName(trafic.name ?? 'TRAFIC');
      }
      setFirstRegisteredAt('2019-01-01');
      setMileage('52900');
      setSeats('5');
      setCarTypeOther('');
      setOwnerKmPerYear('');
      setOwnerKmManuallyEdited(false);
      setPurchaseAmountInclVat('');
    } finally {
      setFillExampleLoading(false);
    }
  }

  const isCarInfoValid = useMemo(() => {
    if (!townId || !brandId || !fuelTypeId || !carTypeId) return false;
    if (carTypeId === CAR_TYPE_OTHER && !carTypeOther.trim()) return false;
    const seatsNum = parseInt(seats.trim(), 10);
    if (!Number.isInteger(seatsNum) || seatsNum < 1) return false;
    if (carChoice === 'newCar') {
      const amount = purchaseAmountInclVat.trim() ? parseFloat(purchaseAmountInclVat.replace(/,/g, '.')) : NaN;
      return Number.isFinite(amount) && amount > 0;
    }
    const mileageNum = mileage.trim() ? parseInt(mileage.trim(), 10) : NaN;
    const date = firstRegistrationDateToDate(firstRegisteredAt);
    if (!Number.isInteger(mileageNum) || mileageNum < 0) return false;
    if (!date || date > new Date()) return false;
    return effectiveOwnerKmPerYear !== null && effectiveOwnerKmPerYear >= 0;
  }, [
    carChoice,
    townId,
    brandId,
    fuelTypeId,
    carTypeId,
    carTypeOther,
    seats,
    mileage,
    firstRegisteredAt,
    effectiveOwnerKmPerYear,
    purchaseAmountInclVat,
  ]);

  useEffect(() => {
    if (screen !== STEP_LOADING || simulationRequestInFlight.current) return;

    const isNewCar = carChoice === 'newCar';
    const seatsNum = parseInt(seats.trim(), 10) || 1;
    const firstRegisteredAtValue = isNewCar
      ? new Date().toISOString().slice(0, 10)
      : firstRegisteredAt.trim() || new Date().toISOString().slice(0, 10);
    const mileageNum = isNewCar ? 0 : parseInt(mileage.trim(), 10) || 0;
    const ownerKmNum = isNewCar ? 0 : (effectiveOwnerKmPerYear ?? 0);

    const body = {
      town: { id: townId, name: townLabel },
      brand: { id: brandId, name: brandLabel },
      fuelType: { id: fuelTypeId, name: fuelTypeName },
      carType: carTypeId && carTypeId !== CAR_TYPE_OTHER ? { id: carTypeId, name: carTypeName } : null,
      carTypeOther: carTypeId === CAR_TYPE_OTHER ? carTypeOther.trim() || null : null,
      mileage: mileageNum,
      ownerKmPerYear: ownerKmNum,
      seats: seatsNum,
      firstRegisteredAt: firstRegisteredAtValue,
      isVan: isVan,
      isNewCar,
      purchasePrice:
        isNewCar && purchaseAmountInclVat.trim()
          ? (() => {
              const n = parseFloat(purchaseAmountInclVat.replace(/,/g, '.'));
              return Number.isFinite(n) && n > 0 ? n : null;
            })()
          : null,
    };

    simulationRequestInFlight.current = true;
    setSimulationError(null);

    fetch('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.errors?.[0]?.message ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        simulationRequestInFlight.current = false;
        setSimulationResult({
          resultCode: data.resultCode as SimulationResultCode,
          message: data.rejectionReason ?? undefined,
          resultInsuranceCostPerYear: data.resultInsuranceCostPerYear ?? null,
          resultTaxCostPerYear: data.resultTaxCostPerYear ?? null,
          resultInspectionCostPerYear: data.resultInspectionCostPerYear ?? null,
          resultMaintenanceCostPerYear: data.resultMaintenanceCostPerYear ?? null,
          ownerKmPerYear: data.ownerKmPerYear,
          resultBenchmarkMinKm: data.resultBenchmarkMinKm ?? null,
          resultBenchmarkAvgKm: data.resultBenchmarkAvgKm ?? null,
          resultBenchmarkMaxKm: data.resultBenchmarkMaxKm ?? null,
          resultEstimatedCarValue: data.resultEstimatedCarValue ?? null,
          resultRoundedKmCost: data.resultRoundedKmCost ?? null,
          resultDepreciationCostKm: data.resultDepreciationCostKm ?? null,
        });
        setScreen(STEP_RESULT);
      })
      .catch((err: Error) => {
        simulationRequestInFlight.current = false;
        setSimulationError(err.message ?? 'An error occurred');
      });
  }, [
    screen,
    loadingAttempt,
    carChoice,
    townId,
    townLabel,
    brandId,
    brandLabel,
    fuelTypeId,
    fuelTypeName,
    carTypeId,
    carTypeName,
    carTypeOther,
    seats,
    isVan,
    mileage,
    firstRegisteredAt,
    effectiveOwnerKmPerYear,
    purchaseAmountInclVat,
  ]);

  const isGent = useMemo(() => {
    const lower = townLabel.toLowerCase();
    const zip = townLabel.replace(/\s/g, '').slice(0, 4);
    return lower.includes('gent') || /^90\d\d/.test(zip);
  }, [townLabel]);

  useEffect(() => {
    if (screen !== STEP_RESULT || !isSuccessResult) {
      setResultHeroAutoState('parked');
      return;
    }
    setResultHeroAutoState('parked');
    const t1 = setTimeout(() => setResultHeroAutoState('driving'), 600);
    const t2 = setTimeout(() => setResultHeroAutoState('gone'), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [screen, isSuccessResult]);

  useEffect(() => {
    if (screen !== STEP_COST_SCENARIOS) return undefined;
    const target = COST_SCENARIO_PEOPLE_BY_INDEX[costScenarioIndex] ?? 14;
    const id = window.setInterval(() => {
      setCostScenarioPeopleDisplayed((c) => {
        if (c === target) {
          window.clearInterval(id);
          return c;
        }
        return c + (target > c ? 1 : -1);
      });
    }, 55);
    return () => window.clearInterval(id);
  }, [screen, costScenarioIndex]);

  const goNext = () => {
    if (screen === STEP_RESULT) {
      setResultDisplayOverride(null);
    }
    capture(`step_${screen}`, {
      result_code: simulationResult?.resultCode ?? null,
    });
    setScreen((s) => Math.min(s + 1, STEP_CONFIRMATION));
  };
  const goPrev = () => setScreen((s) => Math.max(s - 1, STEP_SITUATION));

  const restartSimulationFromNotOk = () => {
    setResultDisplayOverride(null);
    setSimulationResult(null);
    setCarChoice(null);
    simulationRequestInFlight.current = false;
    setScreen(STEP_SITUATION);
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoBox}>
            <div className={styles.logoIcon}>D!</div>
            <div>
              <div className={styles.logoTitle}>{t('header.logoTitle')}</div>
              <div className={styles.logoSub}>{t('header.logoSub')}</div>
            </div>
          </div>
          <div className={styles.headerEnd}>
            <LanguageSwitcher triggerClassName={styles.headerLangTrigger} showLabel />
          </div>
        </div>
      </header>

      {DEV_UI_ENABLED && screen === STEP_RESULT && simulationResult && (
        <div className={styles.resultSecondBar}>
          <div className={styles.resultSecondBarInner}>
            <span className={styles.resultSecondBarTitle}>{t('result.secondBarTitle')}</span>
            <div className={styles.resultSecondBarActions}>
              <span className={styles.resultSecondBarOutcome}>
                {displaySuccess && t('result.secondBarSuccess')}
                {displayNotOk && t('result.secondBarNotOk')}
                {displayUnclear && t('result.secondBarUnclear')}
              </span>
              <div className={styles.resultPreviewBtns}>
                <button
                  type="button"
                  onClick={() => setResultDisplayOverride(resultDisplayOverride === 'success' ? null : 'success')}
                  className={resultDisplayOverride === 'success' ? styles.resultPreviewBtnActive : styles.resultPreviewBtn}
                  title={t('result.previewSuccess')}
                >
                  {t('result.secondBarSuccess')}
                </button>
                <button
                  type="button"
                  onClick={() => setResultDisplayOverride(resultDisplayOverride === 'notOk' ? null : 'notOk')}
                  className={resultDisplayOverride === 'notOk' ? styles.resultPreviewBtnActive : styles.resultPreviewBtn}
                  title={t('result.previewNotOk')}
                >
                  {t('result.secondBarNotOk')}
                </button>
                <button
                  type="button"
                  onClick={() => setResultDisplayOverride(resultDisplayOverride === 'unclear' ? null : 'unclear')}
                  className={resultDisplayOverride === 'unclear' ? styles.resultPreviewBtnActive : styles.resultPreviewBtn}
                  title={t('result.previewUnclear')}
                >
                  {t('result.secondBarUnclear')}
                </button>
                {resultDisplayOverride !== null && (
                  <button
                    type="button"
                    onClick={() => setResultDisplayOverride(null)}
                    className={styles.resultPreviewBtn}
                    title={t('result.previewReal')}
                  >
                    {t('result.previewReal')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {DEV_UI_ENABLED && screen === STEP_CAR_INFO && (
        <div className={styles.resultSecondBar}>
          <div className={styles.resultSecondBarInner}>
            <span className={styles.resultSecondBarTitle}>{t('wageninfo.secondBarTitle')}</span>
            <button type="button" onClick={fillCarInfoExample} disabled={fillExampleLoading} className={styles.secondBarButton}>
              {fillExampleLoading ? '…' : t('wageninfo.fillExample')}
            </button>
          </div>
        </div>
      )}

      {screen === STEP_SITUATION && (
        <div className={styles.page}>
          <h1 className={styles.title}>{t('situatie.title')}</h1>
          <p className={`${styles.body} ${styles.bodyAfterTitle}`}>{t('situatie.body')}</p>
          <div className={styles.tileGrid}>
            {[
              {
                id: 'existing' as CarChoice,
                icon: '🚗',
                titleKey: 'situatie.tileHeeftTitle' as const,
                descKey: 'situatie.tileHeeftDesc' as const,
              },
              {
                id: 'newCar' as CarChoice,
                icon: '🔍',
                titleKey: 'situatie.tileKooptTitle' as const,
                descKey: 'situatie.tileKooptDesc' as const,
              },
            ].map((tile) => {
              const selected = carChoice === tile.id;
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => setCarChoice(tile.id)}
                  className={`${styles.tile} ${selected ? styles.tileSelected : ''}`}
                >
                  <div className={`${styles.tileRadio} ${selected ? styles.tileRadioSelected : ''}`} aria-hidden>
                    {selected && '✓'}
                  </div>
                  <div className={styles.tileIcon}>{tile.icon}</div>
                  <div className={styles.tileTitle}>{t(tile.titleKey)}</div>
                  <div className={styles.tileDesc}>{t(tile.descKey)}</div>
                </button>
              );
            })}
          </div>
          {carChoice === 'newCar' && (
            <div className={styles.amberBanner}>
              <p className={styles.amberBannerText}>{t('situatie.kooptBanner')}</p>
            </div>
          )}
          <div className={`${styles.buttonRow} ${styles.marginTop24}`}>
            <button type="button" onClick={goNext} disabled={!carChoice} className={`${styles.btn} ${styles.btnPrimary}`}>
              {t('situatie.startCta')}
            </button>
          </div>

          <section className={styles.koopgidsSection} aria-label={t('situatie.koopgidsEyebrow')}>
            <p className={styles.koopgidsEyebrow}>{t('situatie.koopgidsEyebrow')}</p>
            <h2 className={styles.koopgidsTitle}>{t('situatie.koopgidsTitle')}</h2>
            <p className={`${styles.body} ${styles.koopgidsBody}`}>{t('situatie.koopgidsBody')}</p>

            <div className={styles.koopgidsCard}>
              <div className={styles.koopgidsCardTitleKnockout}>{t('situatie.koopgidsKnockoutTitle')}</div>
              {(['situatie.koopgidsKnockout1', 'situatie.koopgidsKnockout2', 'situatie.koopgidsKnockout3'] as const).map((key) => (
                <div key={key} className={styles.koopgidsCriterionRow}>
                  <span className={styles.koopgidsIconKnockout} aria-hidden>
                    !
                  </span>
                  <span className={styles.koopgidsCriterionText}>{t(key)}</span>
                </div>
              ))}
            </div>

            <div className={styles.koopgidsCard}>
              <div className={styles.koopgidsCardTitleIdeal}>{t('situatie.koopgidsIdealTitle')}</div>
              {(['situatie.koopgidsIdeal1', 'situatie.koopgidsIdeal2', 'situatie.koopgidsIdeal3'] as const).map((key) => (
                <div key={key} className={styles.koopgidsCriterionRow}>
                  <span className={styles.koopgidsIconIdeal} aria-hidden>
                    ✓
                  </span>
                  <span className={styles.koopgidsCriterionText}>{t(key)}</span>
                </div>
              ))}
            </div>

            <div className={styles.koopgidsTip}>
              <p className={styles.koopgidsTipText}>
                <strong>{t('situatie.koopgidsTipLead')}</strong> {t('situatie.koopgidsTipBody')}
              </p>
            </div>

            <p className={styles.koopgidsFooter}>{t('situatie.koopgidsFooter')}</p>
          </section>
        </div>
      )}

      {screen === STEP_CAR_INFO && (
        <div className={styles.pageTwoCol}>
          <div>
            <p className={styles.eyebrow}>{t('stepOf', { current: 1, total: NUMBERED_STEP_TOTAL })}</p>
            <h1 className={styles.title}>{t('wageninfo.title')}</h1>
            <p className={`${styles.body} ${styles.bodyAfterTitle}`}>{t('wageninfo.body')}</p>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>{t('wageninfo.gemeenteLabel')}</label>
              <p className={styles.fieldHint}>{t('wageninfo.gemeenteHint')}</p>
              <SearchDropdown
                value={townId}
                selectedLabel={townLabel || undefined}
                onValueChange={(id, opt) => {
                  setTownId(id);
                  setTownLabel(opt.name);
                }}
                apiPath="towns"
                labelKey="displayLabel"
                placeholder={t('wageninfo.gemeentePlaceholder')}
              />
              {townLabel.length > 2 && (
                <div className={`${styles.locationBadge} ${isGent ? styles.locationBadgeGent : styles.locationBadgeOther}`}>
                  <div className={`${styles.locationBadgeDot} ${isGent ? styles.locationBadgeDotGent : styles.locationBadgeDotOther}`} />
                  <span className={`${styles.locationBadgeText} ${isGent ? styles.locationBadgeTextGent : styles.locationBadgeTextOther}`}>
                    {isGent ? t('wageninfo.badgeGent') : t('wageninfo.badgeOther')}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formGridTwoCol}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>{t('wageninfo.merkLabel')}</label>
                <SearchDropdown
                  value={brandId}
                  selectedLabel={brandLabel || undefined}
                  onValueChange={(id, opt) => {
                    setBrandId(id);
                    setBrandLabel(opt.name);
                    if (carTypeId) {
                      setCarTypeId('');
                      setCarTypeName('');
                      setCarTypeOther('');
                    }
                  }}
                  apiPath="car-brands"
                  queryParams={{ isActive: 'true' }}
                  placeholder={t('wageninfo.brandPlaceholder')}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>{t('wageninfo.fuelTypeLabel')}</label>
                <select
                  value={fuelTypeId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFuelTypeId(v);
                    setFuelTypeName(fuelTypes.find((f) => f.id === v)?.name ?? '');
                    if (carTypeId) {
                      setCarTypeId('');
                      setCarTypeName('');
                      setCarTypeOther('');
                    }
                  }}
                  disabled={fuelTypesLoading}
                  className={styles.select}
                >
                  <option value="">{t('wageninfo.fuelTypePlaceholder')}</option>
                  {fuelTypes
                    .filter((f) => f.id)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>{t('wageninfo.carTypeLabel')}</label>
              <SearchDropdown
                value={carTypeId}
                selectedLabel={carTypeId === CAR_TYPE_OTHER ? tWizard('carDetails.carTypeOtherOption') : carTypeName || undefined}
                onValueChange={(id, opt) => {
                  setCarTypeId(id);
                  setCarTypeName(opt.name);
                  if (id !== CAR_TYPE_OTHER) setCarTypeOther('');
                }}
                apiPath="car-types"
                queryParams={carTypeQueryParams}
                appendOptions={brandId && fuelTypeId ? [{ id: CAR_TYPE_OTHER, name: tWizard('carDetails.carTypeOtherOption') }] : []}
                placeholder={brandId && fuelTypeId ? t('wageninfo.carTypePlaceholder') : t('wageninfo.carTypePlaceholderFirst')}
                disabled={!brandId || !fuelTypeId}
              />
            </div>
            {carTypeId === CAR_TYPE_OTHER && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>{t('wageninfo.carTypeOtherLabel')}</label>
                <input
                  type="text"
                  value={carTypeOther}
                  onChange={(e) => setCarTypeOther(e.target.value)}
                  placeholder={t('wageninfo.carTypeOtherPlaceholder')}
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.formGridTwoCol}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>{t('wageninfo.seatsLabel')}</label>
                <select value={seats} onChange={(e) => setSeats(e.target.value)} className={styles.select}>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>{t('wageninfo.isVanLabel')}</label>
                <div className={styles.toggleRow}>
                  <button
                    type="button"
                    onClick={() => setIsVan(!isVan)}
                    className={`${styles.toggleTrack} ${isVan ? styles.toggleTrackOn : styles.toggleTrackOff}`}
                    aria-pressed={isVan}
                  >
                    <span className={`${styles.toggleThumb} ${isVan ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
                  </button>
                  <span className={styles.captionInline}>{isVan ? t('wageninfo.isVanYes') : t('wageninfo.isVanNo')}</span>
                </div>
              </div>
            </div>

            {carChoice === 'newCar' && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>{tWizard('mileage.purchaseAmountInclVat')}</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={purchaseAmountInclVat}
                  onChange={(e) => setPurchaseAmountInclVat(e.target.value)}
                  placeholder={tWizard('mileage.purchaseAmountPlaceholder')}
                  className={styles.input}
                />
              </div>
            )}

            {carChoice === 'existing' && (
              <div className={styles.formGridTwoCol}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>{t('wageninfo.mileageLabel')}</label>
                  <input
                    type="number"
                    min={0}
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder={t('wageninfo.mileagePlaceholder')}
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabelRow}>
                    <label htmlFor="sim-first-registration" className={styles.fieldLabelInline}>
                      {t('wageninfo.firstRegistrationLabel')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={styles.fieldHelpTrigger} aria-label={t('wageninfo.firstRegistrationHelpAria')}>
                          ?
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" side="top" className="max-w-[min(18rem,calc(100vw-2rem))] text-sm">
                        <p className="text-muted-foreground m-0 leading-relaxed">{t('wageninfo.firstRegistrationHint')}</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <input
                    id="sim-first-registration"
                    type="date"
                    value={firstRegisteredAt}
                    onChange={(e) => setFirstRegisteredAt(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.fieldLabel}>{t('wageninfo.ownerKmLabel')}</label>
              <div className={styles.ownerKmRow}>
                <input
                  type="number"
                  min={0}
                  value={ownerKmPerYear}
                  onChange={(e) => setOwnerKmPerYear(e.target.value)}
                  placeholder={t('wageninfo.ownerKmPlaceholder')}
                  className={`${styles.input} ${ownerKmEditable ? '' : styles.inputReadOnly}`}
                  readOnly={!ownerKmEditable}
                  aria-readonly={!ownerKmEditable}
                />
                {carChoice === 'existing' && !ownerKmManuallyEdited ? (
                  <button type="button" onClick={() => setOwnerKmManuallyEdited(true)} className={styles.ownerKmEditBtn}>
                    {t('wageninfo.ownerKmEdit')}
                  </button>
                ) : null}
              </div>
              <p className={styles.fieldHint}>
                {ownerKmManuallyEdited
                  ? t('wageninfo.ownerKmEditedHint')
                  : carChoice === 'newCar'
                    ? tWizard('mileage.ownerKmNewCarHint')
                    : computedOwnerKmPerYear != null
                      ? tWizard('mileage.ownerKmPerYearHint')
                      : tWizard('mileage.ownerKmPerYearEmpty')}
              </p>
            </div>

            <div className={`${styles.buttonRow} ${styles.marginTop24}`}>
              <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
                {t('back')}
              </button>
              <button type="button" onClick={goNext} disabled={!isCarInfoValid} className={`${styles.btn} ${styles.btnPrimary}`}>
                {t('wageninfo.submit')}
              </button>
            </div>
          </div>

          <div className={styles.stickySidebar}>
            <FaqByTags tags={SIMULATION_FAQ_TAGS.step1} heading={t('faqCollapsedTitle')} classNames={SIM_FAQ_PANEL} />
          </div>
        </div>
      )}

      {screen === STEP_LOADING && (
        <div className={styles.page}>
          {simulationError ? (
            <div className={`${styles.loadingCard} ${styles.loadingCardError}`}>
              <p className={`${styles.body} ${styles.marginBottom24}`}>{simulationError}</p>
              <div className={styles.loadingErrorActions}>
                <button
                  type="button"
                  onClick={() => {
                    setSimulationError(null);
                    setScreen(STEP_SITUATION);
                  }}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                >
                  {tWizard('results.restart')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulationError(null);
                    simulationRequestInFlight.current = false;
                    setLoadingAttempt((a) => a + 1);
                  }}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  {tWizard('loading.retry')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.simLoadingSection} aria-busy="true">
                <h1 className={styles.loadingHeaderTitle}>
                  {brandLabel && carTypeName
                    ? t('loading.headerTitleWithName', { name: `${brandLabel} ${carTypeName}` })
                    : t('loading.headerTitle')}
                </h1>
                <div
                  className={styles.simLoadingBarTrack}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('loading.progressAriaLabel')}
                >
                  <div
                    key={loadingAttempt}
                    className={styles.simLoadingBarFill}
                    style={{ animationDuration: `${SIMULATION_LOADING_BAR_SECONDS}s` }}
                  />
                </div>
              </div>
              <div className={styles.loadingCard}>
                {[
                  { icon: '📍', labelKey: 'loading.checkingLocation' as const },
                  { icon: '📅', labelKey: 'loading.checkingAgeKm' as const },
                  { icon: '🌱', labelKey: 'loading.checkingEcoscore' as const },
                  { icon: '💶', labelKey: 'loading.checkingCostPerKm' as const },
                ].map((row) => (
                  <div key={row.labelKey} className={styles.loadingRow}>
                    <div className={`${styles.loadingCircle} ${styles.loadingCirclePending}`}>{row.icon}</div>
                    <div>
                      <div className={`${styles.body} ${styles.loadingRowLead}`}>{t(row.labelKey)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={styles.marginTop32}>
            <FaqByTags tags={SIMULATION_FAQ_TAGS.step1} heading={t('faqCollapsedTitle')} classNames={SIM_FAQ_PANEL} />
          </div>
        </div>
      )}

      {screen === STEP_RESULT && simulationResult && (
        <div className={styles.page}>
          <p className={styles.eyebrow}>{t('stepOf', { current: 2, total: NUMBERED_STEP_TOTAL })}</p>

          {displaySuccess && (
            <div className={styles.resultHero}>
              <div className={styles.resultHeroBanner}>
                <div className={styles.resultHeroBannerBg} />
                {[
                  { left: 0, w: 48, h: 60, op: 0.2 },
                  { left: 50, w: 32, h: 44, op: 0.15 },
                  { left: 84, w: 56, h: 70, op: 0.18 },
                  { left: 142, w: 38, h: 52, op: 0.15 },
                  { left: 182, w: 44, h: 64, op: 0.2 },
                  { left: 228, w: 36, h: 48, op: 0.15 },
                  { left: 266, w: 52, h: 72, op: 0.18 },
                  { left: 320, w: 40, h: 56, op: 0.16 },
                  { left: 362, w: 48, h: 60, op: 0.2 },
                ].map((b, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      bottom: 36,
                      left: b.left,
                      width: b.w,
                      height: b.h,
                      background: `rgba(255,255,255,${b.op})`,
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                ))}
                <div className={styles.resultHeroRoad}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className={styles.resultHeroRoadLine}
                      style={{
                        left: `${i * 13 + (resultHeroAutoState !== 'parked' ? -30 : 0)}%`,
                        transition: resultHeroAutoState === 'driving' ? 'left 2s linear' : 'none',
                      }}
                    />
                  ))}
                </div>
                <div className={styles.resultHeroBadge}>
                  <div className={styles.resultHeroBadgeDot}>
                    <span className={styles.resultHeroBadgeCheck}>✓</span>
                  </div>
                  <span className={styles.resultHeroBadgeText}>{t('result.badgeEligible')}</span>
                </div>
                <div
                  className={cn(
                    styles.resultHeroCarWrap,
                    resultHeroAutoState === 'driving' && styles.resultHeroCarWrapDriving,
                    resultHeroAutoState === 'gone' && styles.resultHeroCarWrapGone,
                  )}
                >
                  <svg width="72" height="34" viewBox="0 0 72 34">
                    <circle cx="16" cy="28" r="6" fill="#111" />
                    <circle cx="16" cy="28" r="3" fill="#555" />
                    <circle cx="56" cy="28" r="6" fill="#111" />
                    <circle cx="56" cy="28" r="3" fill="#555" />
                    <rect x="4" y="16" width="64" height="14" rx="4" fill="#285C40" />
                    <path d="M20 16 L26 5 L48 5 L54 16Z" fill="#1A3D2B" />
                    <path d="M27 6.5 L26 14 L47 14 L46 6.5Z" fill="rgba(180,220,195,0.5)" />
                    <ellipse cx="66" cy="20" rx="3.5" ry="2.5" fill={resultHeroAutoState !== 'parked' ? '#FFFBE0' : '#444'} />
                    <rect x="4" y="18" width="3.5" height="4" rx="1" fill="#B83232" />
                  </svg>
                  {resultHeroAutoState === 'driving' && (
                    <div className={styles.resultHeroCarPuffs}>
                      <div className={styles.resultHeroPuff} style={{ animationDuration: '0.7s' }} />
                      <div className={`${styles.resultHeroPuff} ${styles.resultHeroPuffSm}`} style={{ animationDuration: '0.9s' }} />
                      <div className={`${styles.resultHeroPuff} ${styles.resultHeroPuffXs}`} style={{ animationDuration: '1.1s' }} />
                    </div>
                  )}
                </div>
                {resultHeroAutoState === 'gone' && <div className={styles.resultHeroGoneMessage}>{t('result.goneMessage')}</div>}
              </div>
              <div className={styles.resultHeroInner}>
                <h2 className={`${styles.resultHeroTitle} ${styles.resultHeroTitleLight}`}>{t('result.successTitle')}</h2>
                <div className={styles.resultStatGrid}>
                  <div className={styles.resultStatBox}>
                    <div className={styles.resultStatLabel}>{t('result.statTariefgroep')}</div>
                    <div className={styles.resultStatValue}>
                      {simulationResult?.resultCode
                        ? t(
                            `result.statTariefgroep${
                              simulationResult.resultCode === SimulationResultCode.CATEGORY_A
                                ? 'CategoryA'
                                : simulationResult.resultCode === SimulationResultCode.CATEGORY_B
                                  ? 'CategoryB'
                                  : simulationResult.resultCode === SimulationResultCode.HIGHER_RATE
                                    ? 'HigherRate'
                                    : 'Value'
                            }` as 'result.statTariefgroepCategoryA',
                          )
                        : t('result.statTariefgroepValue')}
                    </div>
                    <div className={styles.resultStatSub}>{t('result.statTariefgroepSub')}</div>
                  </div>
                  <div className={styles.resultStatBox}>
                    <div className={styles.resultStatLabel}>{t('result.statWaarde')}</div>
                    <div className={styles.resultStatValue}>
                      {simulationResult?.resultEstimatedCarValue != null
                        ? `€ ${Math.round(simulationResult.resultEstimatedCarValue).toLocaleString('nl-BE')}`
                        : t('result.statWaardeValue')}
                    </div>
                    <div className={styles.resultStatSub}>{t('result.statWaardeSub')}</div>
                  </div>
                  <div className={styles.resultStatBox}>
                    <div className={styles.resultStatLabel}>{t('result.statSlijtage')}</div>
                    <div className={styles.resultStatValue}>
                      {simulationResult?.resultDepreciationCostKm != null
                        ? `€ ${Number(simulationResult.resultDepreciationCostKm).toLocaleString('nl-BE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : t('result.statSlijtageValue')}
                    </div>
                    <div className={styles.resultStatSub}>{t('result.statSlijtageSub')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {displaySuccess && (
            <div className={`${styles.loadingCard} ${styles.loadingCardSpaced}`}>
              {[
                { labelKey: 'loading.checkLocation' as const, subKey: 'loading.checkedLocationSub' as const },
                { labelKey: 'loading.checkAgeKm' as const, subKey: 'loading.checkedAgeKmSub' as const },
                { labelKey: 'loading.checkEcoscore' as const, subKey: 'loading.checkedEcoscoreSub' as const },
                { labelKey: 'loading.checkCostPerKm' as const, subKey: 'loading.checkedCostPerKmSub' as const },
                { labelKey: 'loading.checkValue' as const, subKey: 'loading.checkedValueSub' as const },
              ].map((row) => (
                <div key={row.labelKey} className={`${styles.loadingRow} ${styles.loadingRowPast}`}>
                  <div className={`${styles.loadingCircle} ${styles.loadingCirclePast}`}>✓</div>
                  <div>
                    <div className={`${styles.body} ${styles.resultCheckRowLead}`}>{t(row.labelKey)}</div>
                    <div className={styles.resultCheckRowSub}>{t(row.subKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {displayNotOk && (
            <>
              <div className={styles.noGoCard}>
                <div className={styles.noGoHero}>
                  <div className={`${styles.resultOutcomeCircle} ${styles.resultOutcomeCircleNoGo}`}>
                    <span className={styles.resultOutcomeIconNoGo} aria-hidden>
                      ✕
                    </span>
                  </div>
                  <h2 className={styles.noGoHeroTitle}>{t('result.notOkTitle')}</h2>
                  <p className={styles.noGoHeroIntro}>{t('result.notOkIntro')}</p>
                </div>
                <div className={styles.noGoReason}>
                  <div className={styles.noGoReasonEyebrow}>{t('result.notOkReasonEyebrow')}</div>
                  <div className={styles.noGoReasonTitle}>{simulationResult?.message?.trim() || t('result.notOkReasonTitleFallback')}</div>
                  <p className={styles.noGoReasonBody}>{t('result.notOkReasonDetail')}</p>
                </div>
              </div>
              <div className={styles.noGoWhatNow}>
                <div className={styles.noGoWhatNowTitle}>{t('result.whatNextTitle')}</div>
                <div className={styles.noGoWhatNowRow}>
                  <span className={styles.noGoWhatNowArrow} aria-hidden>
                    →
                  </span>
                  <div>
                    <p className={styles.noGoWhatNowText}>{t('result.whatNextOtherCar')}</p>
                    <button type="button" className={styles.noGoRestartBtn} onClick={restartSimulationFromNotOk}>
                      {t('result.newSimulationCta')}
                    </button>
                  </div>
                </div>
                <div className={`${styles.noGoWhatNowRow} ${styles.noGoWhatNowRowLast}`}>
                  <span className={styles.noGoWhatNowArrow} aria-hidden>
                    →
                  </span>
                  <p className={styles.noGoWhatNowText}>{t('result.whatNextContact')}</p>
                </div>
              </div>
            </>
          )}

          {displayUnclear && (
            <div className={`${styles.resultOutcomeHero} ${styles.resultOutcomeHeroUnclear}`}>
              <div className={styles.resultOutcomeInner}>
                <div className={`${styles.resultOutcomeCircle} ${styles.resultOutcomeCircleUnclear}`}>
                  <span className={styles.resultOutcomeIconUnclear} aria-hidden>
                    🔍
                  </span>
                </div>
                <h2 className={styles.resultOutcomeTitle}>{t('result.unclearTitle')}</h2>
                <p className={`${styles.body} ${styles.resultOutcomeBody}`}>{tWizard('results.unclearBody')}</p>
              </div>
            </div>
          )}

          <p className={styles.footnote}>{t('result.disclaimer')}</p>

          <div className={styles.marginBottom24}>
            <FaqByTags
              tags={
                displaySuccess
                  ? SIMULATION_FAQ_TAGS.step2Approved
                  : displayNotOk
                    ? SIMULATION_FAQ_TAGS.step2Rejected
                    : SIMULATION_FAQ_TAGS.step2Review
              }
              heading={t('faqCollapsedTitle')}
              classNames={SIM_FAQ_PANEL}
            />
          </div>

          <div className={styles.buttonRow}>
            <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
              {t('back')}
            </button>
            {displaySuccess && (
              <button type="button" onClick={goNext} className={`${styles.btn} ${styles.btnPrimary}`}>
                {t('result.nextCta')}
              </button>
            )}
          </div>
        </div>
      )}

      {screen === STEP_COST_SCENARIOS &&
        (() => {
          const annualInsurance = simulationResult?.resultInsuranceCostPerYear ?? 0;
          const annualTax = simulationResult?.resultTaxCostPerYear ?? 0;
          const annualInspection = simulationResult?.resultInspectionCostPerYear ?? 0;
          const annualMaintenance = simulationResult?.resultMaintenanceCostPerYear ?? 0;
          const totalCost = annualInsurance + annualTax + annualInspection + annualMaintenance;
          const hasCosts = totalCost > 0;
          const ownerKm = simulationResult?.ownerKmPerYear ?? 0;
          const benchMin = simulationResult?.resultBenchmarkMinKm ?? 0;
          const benchAvg = simulationResult?.resultBenchmarkAvgKm ?? 0;
          const benchMax = simulationResult?.resultBenchmarkMaxKm ?? 0;
          const sharedKm = [benchMin, benchAvg, benchMax][costScenarioIndex] ?? 0;
          const totalKm = ownerKm + sharedKm;
          const fractionRepaid = totalKm > 0 ? sharedKm / totalKm : 0;
          const amountRepaid = totalCost * fractionRepaid;
          const depPerKm = simulationResult?.resultDepreciationCostKm ?? 0;
          const depAnnualEuro = Math.round(depPerKm * sharedKm);
          const scenarioTotalPerYear = totalCost + depAnnualEuro;
          const neighbourCostSharePercent =
            scenarioTotalPerYear > 0 ? Math.min(100, Math.round((amountRepaid / scenarioTotalPerYear) * 100)) : 0;
          const netBalancePerYear = amountRepaid - scenarioTotalPerYear;
          const estimatedTripsPerYear = Math.max(1, Math.round(sharedKm / 82));
          const fmtEuro = (n: number) => `€ ${Math.round(n).toLocaleString('nl-BE')}`;

          return (
            <div className={styles.pageWide}>
              <p className={styles.eyebrow}>{t('stepOf', { current: 3, total: NUMBERED_STEP_TOTAL })}</p>
              <h1 className={styles.title}>{t('kosten.title')}</h1>

              {hasCosts ? (
                <div className={styles.kostenIntroBox}>
                  <p>
                    {t('kosten.introPart1')}
                    <strong className={styles.kostenIntroStrong}>
                      {fmtEuro(totalCost)}
                      {t('kosten.perYear')}
                    </strong>
                    {t('kosten.introPart2')}
                  </p>
                </div>
              ) : (
                <p className={`${styles.body} ${styles.kostenBodySpacing}`}>{t('kosten.body')}</p>
              )}

              <p className={styles.kostenScenarioHint}>{t('kosten.scenarioHint')}</p>

              <div className={`${styles.scenarioGrid} ${styles.kostenScenarioBlock}`}>
                {[
                  {
                    i: 0,
                    icon: '🌙',
                    labelKey: 'kosten.scenarioWeinig' as const,
                    subKey: 'kosten.scenarioWeinigSub' as const,
                    highlight: false,
                  },
                  {
                    i: 1,
                    icon: '📅',
                    labelKey: 'kosten.scenarioRegelmatig' as const,
                    subKey: 'kosten.scenarioRegelmatigSub' as const,
                    highlight: true,
                  },
                  { i: 2, icon: '⭐', labelKey: 'kosten.scenarioVaak' as const, subKey: 'kosten.scenarioVaakSub' as const, highlight: false },
                ].map((s) => (
                  <button
                    key={s.i}
                    type="button"
                    onClick={() => setCostScenarioIndex(s.i)}
                    className={costScenarioIndex === s.i ? `${styles.scenarioBtn} ${styles.scenarioBtnActive}` : styles.scenarioBtn}
                  >
                    <div className={cn(styles.scenarioBtnCheck, costScenarioIndex === s.i && styles.scenarioBtnCheckActive)} aria-hidden>
                      {costScenarioIndex === s.i ? '✓' : null}
                    </div>
                    <div className={styles.scenarioBtnIcon}>{s.icon}</div>
                    <div className={styles.scenarioBtnLabel}>{t(s.labelKey)}</div>
                    <div className={styles.scenarioBtnSub}>{t(s.subKey)}</div>
                    {s.highlight && <span className={styles.scenarioMedianBadge}>{t('kosten.scenarioMedianBadge')}</span>}
                  </button>
                ))}
              </div>

              {hasCosts && (
                <div className={`${styles.kostenDetailGrid} ${styles.kostenDetailBlock}`}>
                  <div className={styles.kostenDetailCard}>
                    <div className={styles.kostenDetailSection}>
                      <div className={styles.kostenDetailLabel}>{t('kosten.burenBetalingLabel')}</div>
                      <div className={styles.kostenDetailGedekt}>{neighbourCostSharePercent}%</div>
                      <div className={styles.kostenDetailSub}>
                        {t('kosten.burenBetalingOf', { total: `${fmtEuro(scenarioTotalPerYear)}${t('kosten.perYear')}` })}
                      </div>
                      <div className={styles.kostenProgressTrack}>
                        <div className={styles.kostenProgressFill} style={{ width: `${neighbourCostSharePercent}%` }} />
                      </div>
                    </div>
                    <button type="button" onClick={() => setCostDetailOpen(!costDetailOpen)} className={styles.kostenDetailToggle}>
                      <span>{t('kosten.kostenverdelingLabel')}</span>
                      <span className={`${styles.kostenToggleChevron} ${costDetailOpen ? styles.kostenToggleChevronOpen : ''}`}>▼</span>
                    </button>
                    {costDetailOpen && (
                      <div className={styles.kostenDetailBreakdown}>
                        <div className={styles.kostenDetailBreakdownRow}>
                          <div>
                            <span className={styles.kostenDetailRowLabel}>{t('kosten.vasteKostenLabel')}</span>
                            <div className={styles.kostenDetailNote}>{t('kosten.vasteKostenNote')}</div>
                          </div>
                          <span className={styles.kostenDetailRowVal}>{fmtEuro(totalCost)}</span>
                        </div>
                        <div className={styles.kostenDetailBreakdownRow}>
                          <div>
                            <span className={styles.kostenDetailRowLabel}>{t('kosten.slijtageBreakdownLabel')}</span>
                            <div className={styles.kostenDetailNote}>{t('kosten.slijtageNote')}</div>
                          </div>
                          <span className={styles.kostenDetailRowVal}>{fmtEuro(depAnnualEuro)}</span>
                        </div>
                        <div className={`${styles.kostenDetailBreakdownRow} ${styles.kostenBreakdownSep}`}>
                          <span className={styles.kostenDetailRowLabel}>{t('kosten.opbrengstLabel')}</span>
                          <span className={styles.kostenDetailRowVal}>{fmtEuro(amountRepaid)}</span>
                        </div>
                      </div>
                    )}
                    <div className={styles.kostenNettoFooter}>
                      <div className={styles.kostenNettoLabel}>
                        {netBalancePerYear >= 0 ? t('kosten.nettoVoordeel') : t('kosten.nogBijteLegen')}
                      </div>
                      <div className={styles.kostenNettoValue}>
                        € {Math.round(Math.abs(netBalancePerYear)).toLocaleString('nl-BE')}
                        <span className={styles.kostenSidebarPerYear}> /jaar</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.kostenDetailRight}>
                    <div className={styles.kostenRittenCard}>
                      <div className={styles.kostenDetailLabel}>{t('kosten.rittenPerYearLabel')}</div>
                      <div className={styles.kostenRittenValue}>~{estimatedTripsPerYear.toLocaleString('nl-BE')}</div>
                      <div className={styles.kostenDetailSub}>
                        {t('kosten.rittenPerYearSub', {
                          km: Math.round(sharedKm).toLocaleString('nl-BE'),
                        })}
                      </div>
                    </div>
                    <div className={styles.kostenMensenCard}>
                      <div className={styles.kostenDetailLabel}>{t('kosten.mensenHelpTitle')}</div>
                      <div className={styles.kostenMensenNum}>
                        ~{costScenarioPeopleDisplayed}
                        <span className={styles.kostenMensenNumSuffix}> {t('kosten.mensenHelpSuffix')}</span>
                      </div>
                      <div className={styles.kostenMensenDots} aria-hidden>
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className={styles.kostenMensje}>
                            <div
                              className={cn(
                                styles.kostenMensjeDot,
                                i < costScenarioPeopleDisplayed ? styles.kostenMensjeDotOn : styles.kostenMensjeDotOff,
                              )}
                            />
                            <div
                              className={cn(
                                styles.kostenMensjeTorso,
                                i < costScenarioPeopleDisplayed ? styles.kostenMensjeTorsoOn : styles.kostenMensjeTorsoOff,
                              )}
                            />
                          </div>
                        ))}
                      </div>
                      <p className={styles.kostenMensenFootnote}>{t('kosten.mensenHelpBody')}</p>
                    </div>
                    <div className={styles.kostenWagensCard}>
                      <p className={styles.kostenWagensBody}>{t('kosten.wagensReplaceBody', { n: 11 })}</p>
                    </div>
                  </div>
                </div>
              )}

              {!hasCosts && <p className={styles.kostenPlaceholderText}>{t('kosten.placeholder')}</p>}

              <div className={styles.kostenQuarterVariance} role="note">
                <div className={styles.kostenQuarterVarianceTitle}>{t('kosten.quarterVarianceTitle')}</div>
                <p className={styles.kostenQuarterVarianceBody}>{t('kosten.quarterVarianceBody')}</p>
              </div>

              <div className={styles.buttonRow}>
                <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
                  {t('back')}
                </button>
                <button type="button" onClick={goNext} className={`${styles.btn} ${styles.btnPrimary}`}>
                  {t('kosten.nextCta')}
                </button>
              </div>
              <div className={styles.marginTop32}>
                <FaqByTags tags={SIMULATION_FAQ_TAGS.step3} heading={t('faqCollapsedTitle')} classNames={SIM_FAQ_PANEL} />
              </div>
              <p className={styles.kostenBillingDisclaimer}>{t('kosten.billingDataDisclaimer')}</p>
            </div>
          );
        })()}

      {screen === STEP_CONFIRMATION && (
        <div className={styles.page}>
          <div className={styles.bevestigingHeader}>
            <div className={styles.bevestigingIcon}>🎉</div>
            <h1 className={styles.title}>{t('bevestiging.title')}</h1>
            <p className={styles.body}>{t('bevestiging.body')}</p>
          </div>

          <div className={styles.bevestigingFormCard}>
            {!confirmationSent ? (
              <>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>{t('bevestiging.emailLabel')}</label>
                  <input
                    type="email"
                    placeholder={t('bevestiging.emailPlaceholder')}
                    className={styles.input}
                    value={confirmationEmail}
                    onChange={(e) => setConfirmationEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className={`${styles.field} ${styles.bevestigingFieldTight}`}>
                  <label className={styles.fieldLabel}>{t('bevestiging.isMemberLabel')}</label>
                  <div className={styles.bevestigingPathList} role="group" aria-label={t('bevestiging.isMemberLabel')}>
                    {CONFIRMATION_PATH_OPTIONS.map((p) => {
                      const selected = confirmationMemberPath === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setConfirmationMemberPath(p.id)}
                          className={cn(
                            styles.bevestigingPathBtn,
                            selected ? styles.bevestigingPathBtnSelected : styles.bevestigingPathBtnUnselected,
                          )}
                          aria-pressed={selected}
                        >
                          <span className={cn(styles.bevestigingPathCheck, selected && styles.bevestigingPathCheckActive)} aria-hidden>
                            {selected ? '✓' : null}
                          </span>
                          {t(`bevestiging.${p.labelKey}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={!isConfirmationValid}
                  onClick={() => {
                    if (isConfirmationValid) {
                      setConfirmationSent(true);
                    }
                  }}
                >
                  {t('bevestiging.submit')}
                </button>
              </>
            ) : (
              <div className={styles.bevestigingSentRow}>
                <div className={styles.bevestigingSentIcon} aria-hidden>
                  ✓
                </div>
                <div>
                  <div className={styles.bevestigingSentTitle}>{t('bevestiging.sentTitle', { email: confirmationEmail.trim() })}</div>
                  <div className={styles.bevestigingSentSub}>
                    {confirmationMemberPath === 'infosessie' && t('bevestiging.sentSubInfosessie')}
                    {confirmationMemberPath === 'lid' && t('bevestiging.sentSubLid')}
                    {confirmationMemberPath === 'nieuw' && t('bevestiging.sentSubNieuw')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {confirmationSent && confirmationMemberPath && (
            <div className={styles.bevestigingNextCard}>
              <div className={styles.bevestigingNextEyebrow}>{t('bevestiging.whatNext')}</div>
              {confirmationMemberPath === 'nieuw' && (
                <div className={styles.bevestigingNextBlue}>
                  <p className={styles.bevestigingNextBlueText}>
                    <strong>{t('bevestiging.nieuwMemberHintBold')}</strong> {t('bevestiging.nieuwMemberHintRest')}
                  </p>
                </div>
              )}
              {confirmationSteps.map((s, i) => (
                <div key={`${confirmationMemberPath}-${s.n}`} className={styles.bevestigingNextStepRow}>
                  <div
                    className={cn(
                      styles.bevestigingNextStepNum,
                      i === 0 ? styles.bevestigingNextStepNumActive : styles.bevestigingNextStepNumInactive,
                    )}
                  >
                    {s.n}
                  </div>
                  <div className={styles.bevestigingNextStepBody}>
                    <div
                      className={cn(
                        styles.bevestigingNextStepLabel,
                        i === 0 ? styles.bevestigingNextStepLabelActive : styles.bevestigingNextStepLabelInactive,
                      )}
                    >
                      {t(`bevestiging.${s.labelKey}`)}
                    </div>
                    <div className={styles.bevestigingNextStepMeta}>{t(`bevestiging.${s.metaKey}`)}</div>
                    {s.cta && (
                      <a
                        href={t('bevestiging.infosessiePlanHref')}
                        className={styles.bevestigingInfosessieCta}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('bevestiging.infosessiePlanCta')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {carChoice === 'newCar' && (
            <div className={styles.bevestigingKoopCard}>
              <div className={styles.bevestigingKoopTitle}>{t('bevestiging.koopBannerTitle')}</div>
              <p className={styles.bevestigingKoopBody}>{t('bevestiging.koopBannerBody')}</p>
              <a href={t('bevestiging.koopBannerHref')} className={styles.bevestigingKoopBtn} target="_blank" rel="noopener noreferrer">
                {t('bevestiging.koopBannerCta')}
              </a>
            </div>
          )}

          <div className={styles.marginBottom24}>
            <FaqByTags tags={SIMULATION_FAQ_TAGS.step4} heading={t('faqCollapsedTitle')} classNames={SIM_FAQ_PANEL} />
          </div>

          <div className={styles.bevestigingBackRow}>
            <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
              {t('back')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
