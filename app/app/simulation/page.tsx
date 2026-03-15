'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { SimulationResultCode } from '@/domain/simulation.model';
import { calculateOwnerKmPerYear } from '@/domain/utils';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { SearchDropdown } from './components/search-dropdown';
import styles from './simulation.module.css';

const STEP_SITUATIE = 1;
const STEP_WAGENINFO = 2;
const STEP_LOADING = 3;
const STEP_RESULT = 4;
const STEP_KOSTEN_SCENARIOS = 5;
const STEP_BEVESTIGING = 6;

const SCREEN_IDS = ['situatie', 'wageninfo', 'laden', 'resultaat', 'kosten', 'bevestiging'] as const;

const CAR_TYPE_OTHER = '__other__';

type CarChoice = 'existing' | 'newCar';

export default function SimulatiePage() {
  const t = useTranslations('simulatie');
  const tWizard = useTranslations('simulation.wizard');
  const [screen, setScreen] = useState(1);
  const [carChoice, setCarChoice] = useState<CarChoice | null>(null);

  // Step 2 — wageninfo
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
  const [loadingFunnyIndex, setLoadingFunnyIndex] = useState(0);
  const [resultHeroAutoState, setResultHeroAutoState] = useState<'parked' | 'driving' | 'gone'>('parked');
  const [resultDisplayOverride, setResultDisplayOverride] = useState<null | 'success' | 'notOk' | 'unclear'>(null);
  const [kostenScenarioIndex, setKostenScenarioIndex] = useState(1);
  const [kostenDetailOpen, setKostenDetailOpen] = useState(false);
  const [bevestigingEmail, setBevestigingEmail] = useState('');
  const [bevestigingIsMember, setBevestigingIsMember] = useState<'yes' | 'no' | null>(null);
  const simulationRequestInFlight = useRef(false);

  const isBevestigingValid = bevestigingEmail.trim().length > 0 && bevestigingEmail.trim().includes('@') && bevestigingIsMember !== null;

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

  async function fillWageninfoExample() {
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

  const isWageninfoValid = useMemo(() => {
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

  // Cycle funny message in spinner area while loading
  useEffect(() => {
    if (screen !== STEP_LOADING || simulationError !== null) return;
    setLoadingFunnyIndex(0);
    const id = setInterval(() => {
      setLoadingFunnyIndex((i) => (i + 1) % 4);
    }, 1200);
    return () => clearInterval(id);
  }, [screen, simulationError]);

  // Step 4 success hero: badge + car animation (parked → driving → gone)
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

  const maxReachableStep = !simulationResult ? (carChoice ? STEP_WAGENINFO : STEP_SITUATIE) : isSuccessResult ? STEP_BEVESTIGING : STEP_RESULT;

  const isStepReachable = (stepNum: number) => {
    if (stepNum === STEP_LOADING) return screen === STEP_LOADING;
    return stepNum <= maxReachableStep;
  };

  const goNext = () => {
    if (screen === STEP_RESULT) setResultDisplayOverride(null);
    setScreen((s) => Math.min(s + 1, STEP_BEVESTIGING));
  };
  const goPrev = () => setScreen((s) => Math.max(s - 1, STEP_SITUATIE));
  const goTo = (step: number) => {
    if (!isStepReachable(step)) return;
    if (screen === STEP_RESULT) setResultDisplayOverride(null);
    setScreen(step);
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
          <div className={styles.stepDots}>
            {SCREEN_IDS.map((id, i) => {
              const stepNum = i + 1;
              const isPast = screen > stepNum;
              const isCurrent = screen === stepNum;
              const reachable = isStepReachable(stepNum);
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => goTo(stepNum)}
                    title={t(`screens.${id}`)}
                    disabled={!reachable}
                    aria-disabled={!reachable}
                    className={`${styles.stepDot} ${isPast ? styles.stepDotPast : isCurrent ? styles.stepDotCurrent : styles.stepDotFuture} ${!reachable ? styles.stepDotDisabled : ''}`}
                  >
                    {isPast ? '✓' : stepNum}
                  </button>
                  {i < SCREEN_IDS.length - 1 && (
                    <div className={`${styles.stepConnector} ${isPast ? styles.stepConnectorPast : styles.stepConnectorFuture}`} />
                  )}
                </div>
              );
            })}
          </div>
          <LanguageSwitcher triggerClassName={styles.headerLangTrigger} showLabel />
        </div>
      </header>

      {/* Step 4 — Second header bar (result phase) */}
      {screen === STEP_RESULT && simulationResult && (
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

      {/* Step 2 — Second header bar (wageninfo) */}
      {screen === STEP_WAGENINFO && (
        <div className={styles.resultSecondBar}>
          <div className={styles.resultSecondBarInner}>
            <span className={styles.resultSecondBarTitle}>{t('wageninfo.secondBarTitle')}</span>
            <button type="button" onClick={fillWageninfoExample} disabled={fillExampleLoading} className={styles.secondBarButton}>
              {fillExampleLoading ? '…' : t('wageninfo.fillExample')}
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — Situatie */}
      {screen === STEP_SITUATIE && (
        <div className={styles.page}>
          <p className={styles.eyebrow}>{t('stepOf', { current: 1, total: 6 })}</p>
          <h1 className={styles.title}>{t('situatie.title')}</h1>
          <p className={styles.body} style={{ marginBottom: 32 }}>
            {t('situatie.body')}
          </p>
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
          <div className={styles.buttonRow} style={{ marginTop: 24 }}>
            <button type="button" onClick={goNext} disabled={!carChoice} className={`${styles.btn} ${styles.btnPrimary}`}>
              {t('continue')}
            </button>
          </div>
          <div className={styles.faqPlaceholder} style={{ marginTop: 32 }}>
            {t('faqPlaceholder')}
          </div>
        </div>
      )}

      {/* Step 2 — Wageninfo */}
      {screen === STEP_WAGENINFO && (
        <div className={styles.pageTwoCol}>
          <div>
            <p className={styles.eyebrow}>{t('stepOf', { current: 2, total: 6 })}</p>
            <h1 className={styles.title}>{t('wageninfo.title')}</h1>
            <p className={styles.body} style={{ marginBottom: 32 }}>
              {t('wageninfo.body')}
            </p>

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
                <input type="number" min={2} max={9} value={seats} onChange={(e) => setSeats(e.target.value)} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>{t('wageninfo.isVanLabel')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsVan(!isVan)}
                    className={`${styles.toggleTrack} ${isVan ? styles.toggleTrackOn : styles.toggleTrackOff}`}
                    aria-pressed={isVan}
                  >
                    <span className={`${styles.toggleThumb} ${isVan ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
                  </button>
                  <span className={styles.body} style={{ fontSize: 12 }}>
                    {isVan ? t('wageninfo.isVanYes') : t('wageninfo.isVanNo')}
                  </span>
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
                  <label className={styles.fieldLabel}>{t('wageninfo.firstRegistrationLabel')}</label>
                  <input
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

            <div className={styles.buttonRow} style={{ marginTop: 24 }}>
              <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
                {t('back')}
              </button>
              <button type="button" onClick={goNext} disabled={!isWageninfoValid} className={`${styles.btn} ${styles.btnPrimary}`}>
                {t('wageninfo.submit')}
              </button>
            </div>
          </div>

          <div className={styles.stickySidebar}>
            <div className={styles.faqPlaceholder}>{t('faqPlaceholder')}</div>
          </div>
        </div>
      )}

      {/* Step 3 — Loading */}
      {screen === STEP_LOADING && (
        <div className={styles.page}>
          {simulationError ? (
            <div className={styles.loadingCard} style={{ padding: 24 }}>
              <p className={styles.body} style={{ marginBottom: 16 }}>
                {simulationError}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setSimulationError(null);
                    setScreen(STEP_SITUATIE);
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
              {/* Header: progress circle + title + subtitle (mockup step 3) */}
              <div className={styles.loadingHeader}>
                <div className={styles.loadingProgressWrap}>
                  <svg width="56" height="56" className={styles.loadingProgressSvg}>
                    <circle cx="28" cy="28" r="22" fill="none" stroke="var(--sim-sand)" strokeWidth="3.5" />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      fill="none"
                      stroke="var(--sim-brand)"
                      strokeWidth="3.5"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - ((loadingFunnyIndex + 1) * 25) / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 28 28)"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div className={styles.loadingProgressInner} aria-hidden />
                </div>
                <div>
                  <div className={styles.loadingHeaderTitle}>
                    {brandLabel && carTypeName
                      ? t('loading.headerTitleWithName', { name: `${brandLabel} ${carTypeName}` })
                      : t('loading.headerTitle')}
                  </div>
                  <div className={styles.loadingHeaderSubtitle}>
                    {tWizard(
                      ['loading.funny1', 'loading.funny2', 'loading.funny3', 'loading.funny4'][loadingFunnyIndex] as
                        | 'loading.funny1'
                        | 'loading.funny2'
                        | 'loading.funny3'
                        | 'loading.funny4',
                    )}
                  </div>
                </div>
              </div>
              {/* All steps pending */}
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
                      <div className={styles.body} style={{ fontWeight: 600, marginBottom: 2 }}>
                        {t(row.labelKey)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={styles.faqPlaceholder} style={{ marginTop: 32 }}>
            {t('faqPlaceholder')}
          </div>
        </div>
      )}

      {/* Step 4 — Result */}
      {screen === STEP_RESULT && simulationResult && (
        <div className={styles.page}>
          <p className={styles.eyebrow}>{t('stepOf', { current: 4, total: 6 })}</p>

          {displaySuccess && (
            <div className={styles.resultHero}>
              <div className={styles.resultHeroBanner}>
                <div className={styles.resultHeroBannerBg} />
                {/* Decorative car silhouettes */}
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
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>
                  </div>
                  <span className={styles.resultHeroBadgeText}>{t('result.badgeEligible')}</span>
                </div>
                <div
                  className={`${styles.resultHeroCarWrap} ${resultHeroAutoState === 'driving' ? styles.resultHeroCarWrapDriving : ''} ${resultHeroAutoState === 'gone' ? styles.resultHeroCarWrapGone : ''}`}
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
                    <div
                      style={{
                        position: 'absolute',
                        right: '100%',
                        top: 14,
                        display: 'flex',
                        gap: 3,
                        alignItems: 'center',
                      }}
                    >
                      <div className={styles.resultHeroPuff} style={{ animationDuration: '0.7s' }} />
                      <div className={styles.resultHeroPuff} style={{ width: 8, height: 8, animationDuration: '0.9s' }} />
                      <div className={styles.resultHeroPuff} style={{ width: 6, height: 6, animationDuration: '1.1s' }} />
                    </div>
                  )}
                </div>
                {resultHeroAutoState === 'gone' && <div className={styles.resultHeroGoneMessage}>{t('result.goneMessage')}</div>}
              </div>
              <div className={styles.resultHeroInner}>
                <h2 className={styles.resultHeroTitle} style={{ color: '#fff' }}>
                  {t('result.successTitle')}
                </h2>
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
                        ? `€ ${Number(simulationResult.resultDepreciationCostKm).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : t('result.statSlijtageValue')}
                    </div>
                    <div className={styles.resultStatSub}>{t('result.statSlijtageSub')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {displaySuccess && (
            <div className={styles.loadingCard} style={{ marginTop: 24 }}>
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
                    <div className={styles.body} style={{ fontWeight: 600, marginBottom: 2 }}>
                      {t(row.labelKey)}
                    </div>
                    <div style={{ fontFamily: 'var(--sim-sans)', fontSize: 12, color: 'var(--sim-mid)' }}>{t(row.subKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {displayNotOk && (
            <div className={styles.resultHero} style={{ background: 'var(--sim-red-bg)' }}>
              <div className={styles.resultHeroInner} style={{ padding: 32, textAlign: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--sim-surface)',
                    border: '2px solid var(--sim-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <span style={{ color: 'var(--sim-red)', fontSize: 24, fontWeight: 700 }}>✕</span>
                </div>
                <h2 className={styles.resultHeroTitle} style={{ color: 'var(--sim-ink)' }}>
                  {t('result.notOkTitle')}
                </h2>
                <p className={styles.body} style={{ margin: 0 }}>
                  {simulationResult.message || tWizard('results.notOkBody')}
                </p>
              </div>
            </div>
          )}

          {displayUnclear && (
            <div className={styles.resultHero} style={{ background: 'var(--sim-amber-bg)' }}>
              <div className={styles.resultHeroInner} style={{ padding: 32, textAlign: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--sim-surface)',
                    border: '2px solid var(--sim-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <span style={{ fontSize: 24 }}>🔍</span>
                </div>
                <h2 className={styles.resultHeroTitle} style={{ color: 'var(--sim-ink)' }}>
                  {t('result.unclearTitle')}
                </h2>
                <p className={styles.body} style={{ margin: 0 }}>
                  {tWizard('results.unclearBody')}
                </p>
              </div>
            </div>
          )}

          <p
            style={{
              fontFamily: 'var(--sim-sans)',
              fontSize: 11,
              color: 'var(--sim-light)',
              lineHeight: 1.55,
              fontStyle: 'italic',
              marginBottom: 24,
            }}
          >
            {t('result.disclaimer')}
          </p>

          <div className={styles.faqPlaceholder} style={{ marginBottom: 24 }}>
            {t('faqPlaceholder')}
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

      {/* Step 5 — Kosten + Scenarios (merged): costs on right, scenario pickers + blocks below */}
      {screen === STEP_KOSTEN_SCENARIOS &&
        (() => {
          const ins = simulationResult?.resultInsuranceCostPerYear ?? 0;
          const tax = simulationResult?.resultTaxCostPerYear ?? 0;
          const insp = simulationResult?.resultInspectionCostPerYear ?? 0;
          const maint = simulationResult?.resultMaintenanceCostPerYear ?? 0;
          const totalCost = ins + tax + insp + maint;
          const hasCosts = totalCost > 0;
          const ownerKm = simulationResult?.ownerKmPerYear ?? 0;
          const benchMin = simulationResult?.resultBenchmarkMinKm ?? 0;
          const benchAvg = simulationResult?.resultBenchmarkAvgKm ?? 0;
          const benchMax = simulationResult?.resultBenchmarkMaxKm ?? 0;
          const sharedKm = [benchMin, benchAvg, benchMax][kostenScenarioIndex] ?? 0;
          const totalKm = ownerKm + sharedKm;
          const fractionRepaid = totalKm > 0 ? sharedKm / totalKm : 0;
          const amountRepaid = totalCost * fractionRepaid;
          const gedekt = totalCost > 0 ? Math.min(100, Math.round((amountRepaid / totalCost) * 100)) : 0;
          const netto = amountRepaid - totalCost;

          const CostCard = () =>
            hasCosts ? (
              <div className={styles.kostenSidebarCard}>
                <div className={styles.kostenSidebarHeader}>
                  <div className={styles.kostenSidebarLabel}>{t('kosten.yourCostsTotal')}</div>
                  <div className={styles.kostenSidebarTotal}>
                    € {Math.round(totalCost).toLocaleString('nl-BE')}
                    <span className={styles.kostenSidebarPerYear}>{t('kosten.perYear')}</span>
                  </div>
                </div>
                <div className={styles.kostenSidebarRows}>
                  {ins > 0 && (
                    <div className={styles.kostenSidebarRow}>
                      <span>{t('kosten.insurance')}</span>
                      <span>€ {Math.round(ins).toLocaleString('nl-BE')}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className={styles.kostenSidebarRow}>
                      <span>{t('kosten.tax')}</span>
                      <span>€ {Math.round(tax).toLocaleString('nl-BE')}</span>
                    </div>
                  )}
                  {insp > 0 && (
                    <div className={styles.kostenSidebarRow}>
                      <span>{t('kosten.inspection')}</span>
                      <span>€ {Math.round(insp).toLocaleString('nl-BE')}</span>
                    </div>
                  )}
                  {maint > 0 && (
                    <div className={styles.kostenSidebarRow}>
                      <span>{t('kosten.maintenance')}</span>
                      <span>€ {Math.round(maint).toLocaleString('nl-BE')}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className={styles.kostenPlaceholderText}>{t('kosten.placeholder')}</p>
            );

          return (
            <div className={styles.pageTwoCol}>
              <div>
                <p className={styles.eyebrow}>{t('stepOf', { current: 5, total: 6 })}</p>
                <h1 className={styles.title}>{t('kosten.title')}</h1>
                <p className={styles.body} style={{ marginBottom: hasCosts ? 16 : 24 }}>
                  {hasCosts ? t('kosten.bodyWithTotal', { total: Math.round(totalCost).toLocaleString('nl-BE') }) : t('kosten.body')}
                </p>
                <p className={styles.kostenScenarioHint}>{t('kosten.scenarioHint')}</p>

                <div className={styles.scenarioGrid} style={{ marginBottom: 24 }}>
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
                      onClick={() => setKostenScenarioIndex(s.i)}
                      className={kostenScenarioIndex === s.i ? `${styles.scenarioBtn} ${styles.scenarioBtnActive}` : styles.scenarioBtn}
                    >
                      <div className={styles.scenarioBtnIcon}>{s.icon}</div>
                      <div className={styles.scenarioBtnLabel}>{t(s.labelKey)}</div>
                      <div className={styles.scenarioBtnSub}>{t(s.subKey)}</div>
                      {s.highlight && <span className={styles.scenarioMedianBadge}>{t('kosten.scenarioMedianBadge')}</span>}
                    </button>
                  ))}
                </div>

                {/* Blocks below pickers: pro-rata repayment + right column */}
                {hasCosts && (
                  <div className={styles.kostenDetailGrid} style={{ marginBottom: 24 }}>
                    <div className={styles.kostenDetailCard}>
                      <div className={styles.kostenDetailSection}>
                        <div className={styles.kostenDetailLabel}>{t('kosten.burenBetalingLabel')}</div>
                        <div className={styles.kostenDetailGedekt}>{gedekt}%</div>
                        <div className={styles.kostenDetailSub}>
                          {t('kosten.burenBetalingOf', { total: Math.round(totalCost).toLocaleString('nl-BE') })}
                        </div>
                        <div className={styles.kostenProgressTrack}>
                          <div className={styles.kostenProgressFill} style={{ width: `${gedekt}%` }} />
                        </div>
                        <div className={styles.kostenDetailNote}>
                          = € {Math.round(totalCost).toLocaleString('nl-BE')} vaste kosten · {Math.round(fractionRepaid * 100)}% gedeeld
                        </div>
                      </div>
                      <button type="button" onClick={() => setKostenDetailOpen(!kostenDetailOpen)} className={styles.kostenDetailToggle}>
                        <span>{t('kosten.kostenverdelingLabel')}</span>
                        <span style={{ transform: kostenDetailOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                      </button>
                      {kostenDetailOpen && (
                        <div className={styles.kostenDetailBreakdown}>
                          <div className={styles.kostenDetailBreakdownRow}>
                            <div>
                              <span className={styles.kostenDetailRowLabel}>{t('kosten.vasteKostenLabel')}</span>
                              <div className={styles.kostenDetailNote}>{t('kosten.vasteKostenNote')}</div>
                            </div>
                            <span className={styles.kostenDetailRowVal}>€ {Math.round(totalCost).toLocaleString('nl-BE')}</span>
                          </div>
                          <div
                            className={styles.kostenDetailBreakdownRow}
                            style={{ borderTop: '1px solid var(--sim-sand)', paddingTop: 8, marginTop: 8 }}
                          >
                            <span className={styles.kostenDetailRowLabel}>{t('kosten.opbrengstLabel')}</span>
                            <span className={styles.kostenDetailRowVal}>€ {Math.round(amountRepaid).toLocaleString('nl-BE')}</span>
                          </div>
                        </div>
                      )}
                      <div className={styles.kostenNettoFooter}>
                        <div className={styles.kostenNettoLabel}>{netto >= 0 ? t('kosten.nettoVoordeel') : t('kosten.nogBijteLegen')}</div>
                        <div className={styles.kostenNettoValue}>
                          € {Math.round(Math.abs(netto)).toLocaleString('nl-BE')}
                          <span className={styles.kostenSidebarPerYear}> /jaar</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.kostenDetailRight}>
                      <div className={styles.kostenRittenCard}>
                        <div className={styles.kostenDetailLabel}>{t('kosten.kmGedeeldLabel')}</div>
                        <div className={styles.kostenRittenValue}>~{Math.round(sharedKm).toLocaleString('nl-BE')}</div>
                        <div className={styles.kostenDetailSub}>km gedeeld per jaar in dit scenario</div>
                      </div>
                      <div className={styles.kostenWagensCard}>
                        <div className={styles.kostenWagensNum}>11</div>
                        <div className={styles.kostenDetailLabel}>{t('kosten.wagensMinderLabel')}</div>
                        <p className={styles.kostenWagensBody}>{t('kosten.wagensMinderBody', { n: 11 })}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.buttonRow}>
                  <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
                    {t('back')}
                  </button>
                  <button type="button" onClick={goNext} className={`${styles.btn} ${styles.btnPrimary}`}>
                    {t('kosten.nextCta')}
                  </button>
                </div>
                <div className={styles.faqPlaceholder} style={{ marginTop: 32 }}>
                  {t('faqPlaceholder')}
                </div>
              </div>
              <div className={styles.stickySidebar}>
                <CostCard />
              </div>
            </div>
          );
        })()}

      {/* Step 6 — Bevestiging */}
      {screen === STEP_BEVESTIGING && (
        <div className={styles.page}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className={styles.bevestigingIcon}>🎉</div>
            <h1 className={styles.title}>{t('bevestiging.title')}</h1>
            <p className={styles.body}>{t('bevestiging.body')}</p>
          </div>

          <div
            style={{
              background: 'var(--sim-surface)',
              border: '1px solid var(--sim-border)',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div className={styles.field}>
              <label className={styles.fieldLabel}>{t('bevestiging.emailLabel')}</label>
              <input
                type="email"
                placeholder={t('bevestiging.emailPlaceholder')}
                className={styles.input}
                value={bevestigingEmail}
                onChange={(e) => setBevestigingEmail(e.target.value)}
              />
            </div>
            <div className={styles.field} style={{ marginBottom: 24 }}>
              <label className={styles.fieldLabel}>{t('bevestiging.isMemberLabel')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setBevestigingIsMember('yes')}
                  className={`${styles.btn} ${bevestigingIsMember === 'yes' ? styles.btnPrimary : styles.btnSecondary}`}
                  style={{ flex: 1 }}
                  aria-pressed={bevestigingIsMember === 'yes'}
                >
                  {t('bevestiging.isMemberYes')}
                </button>
                <button
                  type="button"
                  onClick={() => setBevestigingIsMember('no')}
                  className={`${styles.btn} ${bevestigingIsMember === 'no' ? styles.btnPrimary : styles.btnSecondary}`}
                  style={{ flex: 1 }}
                  aria-pressed={bevestigingIsMember === 'no'}
                >
                  {t('bevestiging.isMemberNo')}
                </button>
              </div>
            </div>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!isBevestigingValid}>
              {t('bevestiging.submit')}
            </button>
          </div>

          <div className={styles.stepsList}>
            <div className={styles.fieldLabel} style={{ marginBottom: 24 }}>
              {t('bevestiging.whatNext')}
            </div>
            {[
              { n: 1, labelKey: 'bevestiging.step1Label' as const, metaKey: 'bevestiging.step1Meta' as const },
              { n: 2, labelKey: 'bevestiging.step2Label' as const, metaKey: 'bevestiging.step2Meta' as const },
              { n: 3, labelKey: 'bevestiging.step3Label' as const, metaKey: 'bevestiging.step3Meta' as const },
              { n: 4, labelKey: 'bevestiging.step4Label' as const, metaKey: 'bevestiging.step4Meta' as const },
              { n: 5, labelKey: 'bevestiging.step5Label' as const, metaKey: 'bevestiging.step5Meta' as const },
            ].map((s, stepIndex) => (
              <div key={s.n} className={styles.stepItem}>
                <div className={`${styles.stepNum} ${stepIndex === 0 ? styles.stepNumActive : styles.stepNumInactive}`}>{s.n}</div>
                <div>
                  <div className={styles.body} style={{ fontWeight: stepIndex === 0 ? 600 : 500, marginBottom: 4 }}>
                    {t(s.labelKey)}
                  </div>
                  <div style={{ fontFamily: 'var(--sim-sans)', fontSize: 12, color: 'var(--sim-light)' }}>{t(s.metaKey)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.faqPlaceholder} style={{ marginBottom: 24 }}>
            {t('faqPlaceholder')}
          </div>

          <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
            {t('back')}
          </button>
        </div>
      )}
    </div>
  );
}
