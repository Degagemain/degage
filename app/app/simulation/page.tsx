'use client';
import { capture } from '@/app/lib/posthog';
import { analyticsSimulationStepEvent } from '@/domain/analytics-event.model';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { FaqByTags } from '@/app/components/documentation/faq-by-tags';
import { formatDateForInput, parseDateInput } from '@/app/components/form/date-input-helpers';
import { apiPost } from '@/app/lib/api-client';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { SearchableSelect } from '@/app/components/ui/searchable-select';
import { NUMBERED_STEP_TOTAL, SIMULATION_FAQ_TAGS, SIM_FAQ_PANEL } from './simulation-public.constants';
import { simulationLoadingVehicleName } from './simulation-loading-title';
import styles from './simulation.module.css';

const STEP_SITUATION = 1;
const STEP_CAR_INFO = 2;
const STEP_LOADING = 3;

const CAR_TYPE_OTHER = '__other__';

type CarChoice = 'existing' | 'newCar';

/** Visual max duration for the public loading bar (seconds); navigation happens as soon as the API responds. */
const SIMULATION_LOADING_BAR_SECONDS = 60;

const TOWN_SEARCH_PASS_THROUGH_KEYS = ['hasActiveMembers', 'municipality', 'highDemand'] as const;

export default function SimulationPage() {
  const router = useRouter();
  const t = useTranslations('simulationPublic');
  const tWizard = useTranslations('simulation.wizard');
  const tShared = useTranslations('common');
  const [screen, setScreen] = useState(1);
  const [carChoice, setCarChoice] = useState<CarChoice | null>(null);

  const [townId, setTownId] = useState('');
  const [townLabel, setTownLabel] = useState('');
  const [townHighDemand, setTownHighDemand] = useState(false);
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
  const [purchaseAmountInclVat, setPurchaseAmountInclVat] = useState('');
  const [isCommercialVehicle, setIsCommercialVehicle] = useState(false);
  const [isNewCar, setIsNewCar] = useState(false);

  const [fuelTypes, setFuelTypes] = useState<{ id: string; name: string }[]>([]);
  const [fuelTypesLoading, setFuelTypesLoading] = useState(true);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(0);
  const simulationRequestInFlight = useRef(false);
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

  function firstRegistrationDateToDate(value: string): Date | null {
    return parseDateInput(value);
  }

  function todayIsoDate(): string {
    return formatDateForInput(new Date());
  }

  function setIsNewCarChecked(checked: boolean) {
    setIsNewCar(checked);
    if (checked) {
      setMileage('');
      setFirstRegisteredAt(todayIsoDate());
    }
  }

  const parsedOwnerKmPerYear = useMemo(() => {
    const n = ownerKmPerYear.trim() ? parseInt(ownerKmPerYear.trim(), 10) : NaN;
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [ownerKmPerYear]);

  const carTypeQueryParams = useMemo(
    () => (brandId && fuelTypeId ? { brandId, fuelTypeId, isActive: 'true' } : undefined),
    [brandId, fuelTypeId],
  );

  const isCarInfoValid = useMemo(() => {
    if (isCommercialVehicle) return false;
    if (!townId || !brandId || !fuelTypeId || !carTypeId) return false;
    if (carTypeId === CAR_TYPE_OTHER && !carTypeOther.trim()) return false;
    const seatsNum = parseInt(seats.trim(), 10);
    if (!Number.isInteger(seatsNum) || seatsNum < 1) return false;
    if (carChoice === 'newCar') {
      const amount = purchaseAmountInclVat.trim() ? parseFloat(purchaseAmountInclVat.replace(/,/g, '.')) : NaN;
      if (!Number.isFinite(amount) || amount <= 0) return false;
      if (isNewCar) return parsedOwnerKmPerYear !== null;
      const mileageNum = mileage.trim() ? parseInt(mileage.trim(), 10) : NaN;
      const date = firstRegistrationDateToDate(firstRegisteredAt);
      if (!Number.isInteger(mileageNum) || mileageNum < 0) return false;
      if (!date || date > new Date()) return false;
      return parsedOwnerKmPerYear !== null;
    }
    const mileageNum = mileage.trim() ? parseInt(mileage.trim(), 10) : NaN;
    const date = firstRegistrationDateToDate(firstRegisteredAt);
    if (!Number.isInteger(mileageNum) || mileageNum < 0) return false;
    if (!date || date > new Date()) return false;
    return parsedOwnerKmPerYear !== null;
  }, [
    carChoice,
    isCommercialVehicle,
    isNewCar,
    townId,
    brandId,
    fuelTypeId,
    carTypeId,
    carTypeOther,
    seats,
    mileage,
    firstRegisteredAt,
    parsedOwnerKmPerYear,
    purchaseAmountInclVat,
  ]);

  useEffect(() => {
    if (screen !== STEP_LOADING || simulationRequestInFlight.current) return;

    const isPurchased = carChoice === 'newCar';
    const isNewCarValue = isPurchased && isNewCar;
    const seatsNum = parseInt(seats.trim(), 10) || 1;
    const firstRegisteredAtValue = isNewCarValue ? todayIsoDate() : firstRegisteredAt.trim() || todayIsoDate();
    const mileageNum = isNewCarValue ? 0 : parseInt(mileage.trim(), 10) || 0;
    const ownerKmNum = parsedOwnerKmPerYear ?? 0;

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
      isPurchased,
      isNewCar: isNewCarValue,
      purchasePrice:
        isPurchased && purchaseAmountInclVat.trim()
          ? (() => {
              const n = parseFloat(purchaseAmountInclVat.replace(/,/g, '.'));
              return Number.isFinite(n) && n > 0 ? n : null;
            })()
          : null,
    };

    simulationRequestInFlight.current = true;
    setSimulationError(null);

    apiPost('/api/simulations', body)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.errors?.[0]?.message ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        simulationRequestInFlight.current = false;
        if (typeof data.id !== 'string') {
          throw new Error('Simulation was not saved');
        }
        router.push(`/app/simulation/${data.id}`);
      })
      .catch((err: Error) => {
        simulationRequestInFlight.current = false;
        setSimulationError(err.message ?? 'An error occurred');
      });
  }, [
    screen,
    loadingAttempt,
    carChoice,
    isNewCar,
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
    parsedOwnerKmPerYear,
    purchaseAmountInclVat,
    router,
  ]);

  const loadingVehicleName = simulationLoadingVehicleName({
    brandLabel,
    carTypeName,
    isOtherCarType: carTypeId === CAR_TYPE_OTHER,
  });

  const goNext = () => {
    capture(analyticsSimulationStepEvent(screen), { result_code: null });
    setScreen((s) => Math.min(s + 1, STEP_LOADING));
  };
  const goPrev = () => setScreen((s) => Math.max(s - 1, STEP_SITUATION));

  return (
    <div className={styles.root}>
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
          <div className={styles.buttonRow}>
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
              {(
                [
                  'situatie.koopgidsKnockout1',
                  'situatie.koopgidsKnockout2',
                  'situatie.koopgidsKnockout3',
                  'situatie.koopgidsKnockout4',
                ] as const
              ).map((key) => (
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
          </section>
        </div>
      )}

      {screen === STEP_CAR_INFO && (
        <div className={styles.page}>
          <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary} ${styles.backBtnTop}`}>
            {t('back')}
          </button>
          <p className={styles.eyebrow}>{t('stepOf', { current: 1, total: NUMBERED_STEP_TOTAL })}</p>
          <h1 className={styles.title}>{t('wageninfo.title')}</h1>
          <p className={`${styles.body} ${styles.bodyAfterTitle}`}>
            {t('wageninfo.body')}
            {process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL && (
              <>
                {' '}
                <a href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
                  {t('wageninfo.privacyPolicyLink')}
                </a>
              </>
            )}
          </p>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('wageninfo.bedrijfswagenLabel')}</label>
            <p className={styles.fieldHint}>{t('wageninfo.bedrijfswagenHint')}</p>
            <div className={styles.toggleRow}>
              <button
                type="button"
                onClick={() => setIsCommercialVehicle(!isCommercialVehicle)}
                className={`${styles.toggleTrack} ${isCommercialVehicle ? styles.toggleTrackOn : styles.toggleTrackOff}`}
                aria-pressed={isCommercialVehicle}
              >
                <span className={`${styles.toggleThumb} ${isCommercialVehicle ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
              </button>
              <span className={styles.captionInline}>{isCommercialVehicle ? tShared('yes') : tShared('no')}</span>
            </div>
            {isCommercialVehicle && (
              <div className={`${styles.amberBanner} ${styles.amberBannerSpaced}`} role="alert">
                <p className={styles.amberBannerText}>{t('wageninfo.bedrijfswagenWarning')}</p>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('wageninfo.gemeenteLabel')}</label>
            <p className={styles.fieldHint}>{t('wageninfo.gemeenteHint')}</p>
            <SearchableSelect
              unstyledTrigger
              triggerClassName={styles.searchDropdownTrigger}
              value={townId}
              selectedLabel={townLabel || undefined}
              onValueChange={(id, opt) => {
                setTownId(id);
                setTownLabel(opt.name);
                setTownHighDemand(opt.highDemand === true);
              }}
              apiPath="towns"
              labelKey="displayLabel"
              passThroughKeys={TOWN_SEARCH_PASS_THROUGH_KEYS}
              placeholder={t('wageninfo.gemeentePlaceholder')}
            />
            {townHighDemand && (
              <div className={`${styles.locationBadge} ${styles.locationBadgeGent}`}>
                <div className={`${styles.locationBadgeDot} ${styles.locationBadgeDotGent}`} />
                <span className={`${styles.locationBadgeText} ${styles.locationBadgeTextGent}`}>{t('wageninfo.badgeHighDemand')}</span>
              </div>
            )}
          </div>

          <div className={styles.formGridTwoCol}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>{t('wageninfo.merkLabel')}</label>
              <SearchableSelect
                unstyledTrigger
                triggerClassName={styles.searchDropdownTrigger}
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
            <SearchableSelect
              unstyledTrigger
              triggerClassName={styles.searchDropdownTrigger}
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
                {Array.from({ length: 8 }, (_, i) => i + 2).map((n) => (
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
                <span className={styles.captionInline}>{isVan ? tShared('yes') : tShared('no')}</span>
              </div>
            </div>
          </div>

          {carChoice === 'newCar' && (
            <>
              <div className={styles.formGridTwoCol}>
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
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>{t('wageninfo.isNewCarLabel')}</label>
                  <div className={styles.toggleRow}>
                    <button
                      type="button"
                      onClick={() => setIsNewCarChecked(!isNewCar)}
                      className={`${styles.toggleTrack} ${isNewCar ? styles.toggleTrackOn : styles.toggleTrackOff}`}
                      aria-pressed={isNewCar}
                    >
                      <span className={`${styles.toggleThumb} ${isNewCar ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
                    </button>
                    <span className={styles.captionInline}>{isNewCar ? t('wageninfo.isNewCarYes') : t('wageninfo.isNewCarNo')}</span>
                  </div>
                </div>
              </div>
              {!isNewCar && (
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
                      <label htmlFor="sim-first-registration-purchase" className={styles.fieldLabelInline}>
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
                      id="sim-first-registration-purchase"
                      type="date"
                      value={firstRegisteredAt}
                      onChange={(e) => setFirstRegisteredAt(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              )}
            </>
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
            <input
              type="number"
              min={1}
              required
              value={ownerKmPerYear}
              onChange={(e) => setOwnerKmPerYear(e.target.value)}
              placeholder={t('wageninfo.ownerKmPlaceholder')}
              className={styles.input}
            />
            <p className={styles.fieldHint}>{t('wageninfo.ownerKmHint')}</p>
          </div>

          <div className={styles.buttonRow}>
            <button type="button" onClick={goPrev} className={`${styles.btn} ${styles.btnSecondary}`}>
              {t('back')}
            </button>
            <button type="button" onClick={goNext} disabled={!isCarInfoValid} className={`${styles.btn} ${styles.btnPrimary}`}>
              {t('wageninfo.submit')}
            </button>
          </div>

          <div className={styles.marginTop32}>
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
                  {loadingVehicleName ? t('loading.headerTitleWithName', { name: loadingVehicleName }) : t('loading.headerTitle')}
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
    </div>
  );
}
