'use client';

import { capture } from '@/app/lib/posthog';
import { apiPost } from '@/app/lib/api-client';
import { FaqByTags } from '@/app/components/documentation/faq-by-tags';
import type { PublicSimulation } from '@/actions/simulation/read';
import { SimulationResultCode } from '@/domain/simulation.model';
import { cn } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  CONFIRMATION_PATH_OPTIONS,
  CONFIRMATION_STEPS_BY_PATH,
  COST_SCENARIO_PEOPLE_BY_INDEX,
  type ConfirmationMemberPath,
  NEW_REGION_START_DOC_HREF,
  NUMBERED_STEP_TOTAL,
  SIMULATION_FAQ_TAGS,
  SIM_FAQ_PANEL,
  STEP_CONFIRMATION,
  STEP_COST_SCENARIOS,
  STEP_RESULT,
} from '../simulation-public.constants';
import styles from '../simulation.module.css';

type Props = {
  simulation: PublicSimulation;
};

export function SimulationResultView({ simulation }: Props) {
  const router = useRouter();
  const t = useTranslations('simulationPublic');
  const tWizard = useTranslations('simulation.wizard');

  const [screen, setScreen] = useState(STEP_RESULT);
  const [resultHeroAutoState, setResultHeroAutoState] = useState<'parked' | 'driving' | 'gone'>('parked');
  const [costScenarioIndex, setCostScenarioIndex] = useState(1);
  const [costDetailOpen, setCostDetailOpen] = useState(false);
  const [costScenarioPeopleDisplayed, setCostScenarioPeopleDisplayed] = useState(14);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmationMemberPath, setConfirmationMemberPath] = useState<ConfirmationMemberPath | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [manualReviewEmail, setManualReviewEmail] = useState('');
  const [manualReviewStatus, setManualReviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const prevScreenRef = useRef(screen);

  const simulationId = simulation.id;
  const isPurchasedCar = simulation.isPurchased;

  const confirmationEmailOk = confirmationEmail.trim().length > 0 && confirmationEmail.trim().includes('@');
  const isConfirmationValid = confirmationEmailOk;

  const confirmationSteps = useMemo(
    () => (confirmationMemberPath ? CONFIRMATION_STEPS_BY_PATH[confirmationMemberPath] : []),
    [confirmationMemberPath],
  );

  useEffect(() => {
    if (prevScreenRef.current === STEP_CONFIRMATION && screen !== STEP_CONFIRMATION) {
      setConfirmationStatus('idle');
      setConfirmationMemberPath(null);
    }
    prevScreenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    if (screen !== STEP_RESULT) {
      setManualReviewStatus('idle');
      setManualReviewEmail('');
    }
  }, [screen]);

  const isSuccessResult =
    simulation.resultCode === SimulationResultCode.CATEGORY_A || simulation.resultCode === SimulationResultCode.CATEGORY_B;
  const isNotOkResult = simulation.resultCode === SimulationResultCode.NOT_OK;
  const isUnclearResult = simulation.resultCode === SimulationResultCode.MANUAL_REVIEW;

  const displaySuccess = isSuccessResult;
  const displayNotOk = isNotOkResult;
  const displayUnclear = isUnclearResult;
  const showNewRegionWarning = displaySuccess && !simulation.townHasActiveMembers;
  const townDisplayName = simulation.townMunicipality || simulation.town.name || '';

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
    capture(`step_${screen + 3}`, {
      result_code: simulation.resultCode,
    });
    setScreen((s) => Math.min(s + 1, STEP_CONFIRMATION));
  };

  const goPrev = () => setScreen((s) => Math.max(s - 1, STEP_RESULT));

  const startNewSimulation = () => {
    router.push('/app/simulation');
  };

  const submitManualReviewRequest = async () => {
    const email = manualReviewEmail.trim();
    if (!simulationId || !email.includes('@')) return;
    setManualReviewStatus('loading');
    try {
      const res = await apiPost('/api/simulations/request-manual-review', {
        id: simulationId,
        email,
      });
      if (res.status === 204) {
        setManualReviewStatus('success');
        return;
      }
      setManualReviewStatus('error');
    } catch {
      setManualReviewStatus('error');
    }
  };

  const submitConfirmationResultEmail = async () => {
    const email = confirmationEmail.trim();
    if (!simulationId || !email.includes('@') || !isConfirmationValid) return;
    setConfirmationStatus('loading');
    try {
      const res = await apiPost('/api/simulations/confirm-result-email', { id: simulationId, email });
      if (res.status === 204) {
        setConfirmationStatus('success');
        return;
      }
      setConfirmationStatus('error');
    } catch {
      setConfirmationStatus('error');
    }
  };

  const displayCarValue =
    simulation.isPurchased && simulation.purchasePrice != null ? simulation.purchasePrice : simulation.resultEstimatedCarValue;

  return (
    <div className={styles.root}>
      {screen === STEP_RESULT && (
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
                      {t(
                        `result.statTariefgroep${
                          simulation.resultCode === SimulationResultCode.CATEGORY_A
                            ? 'CategoryA'
                            : simulation.resultCode === SimulationResultCode.CATEGORY_B
                              ? 'CategoryB'
                              : 'Value'
                        }` as 'result.statTariefgroepCategoryA',
                      )}
                    </div>
                    <div className={styles.resultStatSub}>
                      {t(
                        `result.statTariefgroepSub${
                          simulation.resultCode === SimulationResultCode.CATEGORY_A
                            ? 'CategoryA'
                            : simulation.resultCode === SimulationResultCode.CATEGORY_B
                              ? 'CategoryB'
                              : 'Value'
                        }` as 'result.statTariefgroepSubCategoryA',
                      )}
                    </div>
                  </div>
                  <div className={styles.resultStatBox}>
                    <div className={styles.resultStatLabel}>{isPurchasedCar ? t('result.statWaardePurchased') : t('result.statWaarde')}</div>
                    <div className={styles.resultStatValue}>
                      {displayCarValue != null ? `€ ${Math.round(displayCarValue).toLocaleString('nl-BE')}` : t('result.statWaardeValue')}
                    </div>
                    <div className={styles.resultStatSub}>{t('result.statWaardeSub')}</div>
                  </div>
                  <div className={styles.resultStatBox}>
                    <div className={styles.resultStatLabel}>{t('result.statSlijtage')}</div>
                    <div className={styles.resultStatValue}>
                      {simulation.resultDepreciationCostKm != null
                        ? `€ ${Number(simulation.resultDepreciationCostKm).toLocaleString('nl-BE', {
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

          {showNewRegionWarning && (
            <div className={`${styles.amberBanner} ${styles.amberBannerSpaced}`} role="note">
              <p className={styles.amberBannerText}>
                {t.rich('newRegionWarning', {
                  town: townDisplayName,
                  link: (chunks) => (
                    <a href={NEW_REGION_START_DOC_HREF} target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
                      {chunks}
                    </a>
                  ),
                })}
              </p>
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
                  <div className={styles.noGoReasonTitle}>{simulation.rejectionReason?.trim() || t('result.notOkReasonTitleFallback')}</div>
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
                    <button type="button" className={styles.noGoRestartBtn} onClick={startNewSimulation}>
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
            <>
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
              <div className={`${styles.bevestigingFormCard} ${styles.marginBottom24}`}>
                {manualReviewStatus === 'success' ? (
                  <p className={`${styles.body} ${styles.marginBottom0}`}>{t('result.manualReviewSent')}</p>
                ) : (
                  <>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="manual-review-email">
                        {t('result.manualReviewEmailLabel')}
                      </label>
                      <input
                        id="manual-review-email"
                        type="email"
                        autoComplete="email"
                        className={styles.input}
                        placeholder={t('result.manualReviewEmailPlaceholder')}
                        value={manualReviewEmail}
                        onChange={(e) => {
                          setManualReviewEmail(e.target.value);
                          if (manualReviewStatus === 'error') setManualReviewStatus('idle');
                        }}
                        disabled={manualReviewStatus === 'loading' || !simulationId}
                      />
                    </div>
                    <p className={styles.fieldHint}>{t('result.manualReviewHint')}</p>
                    {!simulationId && <p className={styles.manualReviewMuted}>{t('result.manualReviewUnavailable')}</p>}
                    {manualReviewStatus === 'error' && (
                      <p className={styles.manualReviewAlert} role="alert">
                        {t('result.manualReviewError')}
                      </p>
                    )}
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      disabled={manualReviewStatus === 'loading' || !simulationId || !manualReviewEmail.trim().includes('@')}
                      onClick={() => void submitManualReviewRequest()}
                    >
                      {t('result.manualReviewCta')}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {displaySuccess && (
            <div className={styles.buttonRow}>
              <button type="button" onClick={goNext} className={`${styles.btn} ${styles.btnPrimary}`}>
                {t('result.nextCta')}
              </button>
            </div>
          )}

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

          <p className={styles.footnote}>{t('result.disclaimer')}</p>
        </div>
      )}

      {screen === STEP_COST_SCENARIOS &&
        (() => {
          const annualInsurance = simulation.resultInsuranceCostPerYear ?? 0;
          const annualTax = simulation.resultTaxCostPerYear ?? 0;
          const annualInspection = simulation.resultInspectionCostPerYear ?? 0;
          const annualMaintenance = simulation.resultMaintenanceCostPerYear ?? 0;
          const totalCost = annualInsurance + annualTax + annualInspection + annualMaintenance;
          const hasCosts = totalCost > 0;
          const ownerKm = simulation.ownerKmPerYear ?? 0;
          const sharedKmOptions = [simulation.resultMinSharedKm ?? 0, simulation.resultAvgSharedKm ?? 0, simulation.resultMaxSharedKm ?? 0];
          const sharedKm = sharedKmOptions[costScenarioIndex] ?? 0;
          const totalKm = ownerKm + sharedKm;
          const ownerCostFraction = totalKm > 0 ? ownerKm / totalKm : 1;
          const fixedCostRepaid = totalCost * (1 - ownerCostFraction);
          const depPerKm = simulation.resultDepreciationCostKm ?? 0;
          const depAnnualEuro = Math.round(depPerKm * sharedKm);
          const amountRepaid = fixedCostRepaid + depAnnualEuro;
          const scenarioTotalPerYear = totalCost + depAnnualEuro;
          const neighbourCostSharePercent =
            scenarioTotalPerYear > 0 ? Math.min(100, Math.round((amountRepaid / scenarioTotalPerYear) * 100)) : 0;
          const netBalancePerYear = amountRepaid - scenarioTotalPerYear;
          const savingsPerYear = netBalancePerYear >= 0 ? netBalancePerYear : amountRepaid;
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
                    icon: '🔴',
                    labelKey: 'kosten.scenarioWeinig' as const,
                    subKey: 'kosten.scenarioWeinigSub' as const,
                    highlight: false,
                  },
                  {
                    i: 1,
                    icon: '🟡',
                    labelKey: 'kosten.scenarioRegelmatig' as const,
                    subKey: 'kosten.scenarioRegelmatigSub' as const,
                    highlight: true,
                  },
                  { i: 2, icon: '🟢', labelKey: 'kosten.scenarioVaak' as const, subKey: 'kosten.scenarioVaakSub' as const, highlight: false },
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
                      </div>
                    )}
                    <div className={styles.kostenNettoFooter}>
                      <div className={styles.kostenNettoLabel}>
                        {netBalancePerYear >= 0 ? t('kosten.nettoVoordeel') : t('kosten.besparing')}
                      </div>
                      <div className={styles.kostenNettoValue}>
                        € {Math.round(savingsPerYear).toLocaleString('nl-BE')}
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

          {showNewRegionWarning && (
            <div className={`${styles.amberBanner} ${styles.amberBannerSpaced}`} role="note">
              <p className={styles.amberBannerText}>
                {t.rich('newRegionWarning', {
                  town: townDisplayName,
                  link: (chunks) => (
                    <a href={NEW_REGION_START_DOC_HREF} target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
          )}

          <div className={styles.bevestigingFormCard}>
            {confirmationStatus !== 'success' ? (
              <>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>{t('bevestiging.emailLabel')}</label>
                  <input
                    type="email"
                    placeholder={t('bevestiging.emailPlaceholder')}
                    className={styles.input}
                    value={confirmationEmail}
                    onChange={(e) => {
                      setConfirmationEmail(e.target.value);
                      if (confirmationStatus === 'error') setConfirmationStatus('idle');
                    }}
                    autoComplete="email"
                    disabled={confirmationStatus === 'loading'}
                  />
                </div>
                <div hidden className={`${styles.field} ${styles.bevestigingFieldTight}`}>
                  <label className={styles.fieldLabel}>{t('bevestiging.isMemberLabel')}</label>
                  <div className={styles.bevestigingPathList} role="group" aria-label={t('bevestiging.isMemberLabel')}>
                    {CONFIRMATION_PATH_OPTIONS.map((p) => {
                      const selected = confirmationMemberPath === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setConfirmationMemberPath(p.id);
                            if (confirmationStatus === 'error') setConfirmationStatus('idle');
                          }}
                          className={cn(
                            styles.bevestigingPathBtn,
                            selected ? styles.bevestigingPathBtnSelected : styles.bevestigingPathBtnUnselected,
                          )}
                          aria-pressed={selected}
                          disabled={confirmationStatus === 'loading'}
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
                {!simulationId && <p className={styles.manualReviewMuted}>{t('bevestiging.submitUnavailable')}</p>}
                {confirmationStatus === 'error' && (
                  <p className={styles.manualReviewAlert} role="alert">
                    {t('bevestiging.submitError')}
                  </p>
                )}
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={!isConfirmationValid || !simulationId || confirmationStatus === 'loading'}
                  onClick={() => void submitConfirmationResultEmail()}
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
                    {!isPurchasedCar
                      ? t('bevestiging.sentSubRegularCar')
                      : confirmationMemberPath === 'infosessie'
                        ? t('bevestiging.sentSubInfosessie')
                        : confirmationMemberPath === 'lid'
                          ? t('bevestiging.sentSubLid')
                          : confirmationMemberPath === 'nieuw'
                            ? t('bevestiging.sentSubNieuw')
                            : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {confirmationStatus === 'success' && !isPurchasedCar && (
            <div className={styles.bevestigingNextCard}>
              <div className={styles.bevestigingNextEyebrow}>{t('bevestiging.whatNext')}</div>
              <p className={`${styles.body} ${styles.bevestigingNextRegularBody}`}>{t('bevestiging.whatNextRegularBody')}</p>
            </div>
          )}

          {confirmationStatus === 'success' && confirmationMemberPath && isPurchasedCar && (
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

          {isPurchasedCar && (
            <div className={styles.bevestigingKoopCard}>
              <div className={styles.bevestigingKoopTitle}>{t('bevestiging.koopBannerTitle')}</div>
              <p className={styles.bevestigingKoopBody}>{t('bevestiging.koopBannerBody')}</p>
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
