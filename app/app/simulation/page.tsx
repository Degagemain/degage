'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Car,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';

import { SimulationResultCode } from '@/domain/simulation.model';
import { calculateOwnerKmPerYear } from '@/domain/utils';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { SearchableSelect } from '@/app/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';

const STEP_INTRO = 1;
const STEP_CAR_CHOICE = 2;
const STEP_TOWN = 3;
const STEP_CAR_DETAILS = 4;
const STEP_MILEAGE = 5;
const STEP_LOADING = 6;
const STEP_RESULTS = 7;

/** Green accent for simulation wizard buttons and selected cards */
const accentButtonClass = 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/50';

const CAR_TYPE_OTHER = '__other__';

export type SimulationCarChoice = 'new' | 'existing';

function FirstRegistrationDatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const date = value.trim()
    ? (() => {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? undefined : d;
      })()
    : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, 'dd-MM-yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onChange(format(selectedDate, 'yyyy-MM-dd'));
              setOpen(false);
            }
          }}
          captionLayout="dropdown"
          fromYear={1990}
          toYear={new Date().getFullYear()}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function SimulationPage() {
  const [step, setStep] = useState(1);
  const [carChoice, setCarChoice] = useState<SimulationCarChoice | null>(null);
  const [townId, setTownId] = useState('');
  const [townLabel, setTownLabel] = useState('');
  const [cantSeeTownExpanded, setCantSeeTownExpanded] = useState(false);
  const [brandId, setBrandId] = useState('');
  const [brandLabel, setBrandLabel] = useState('');
  const [fuelTypeId, setFuelTypeId] = useState('');
  const [fuelTypeName, setFuelTypeName] = useState('');
  const [carTypeId, setCarTypeId] = useState('');
  const [carTypeName, setCarTypeName] = useState('');
  const [carTypeOther, setCarTypeOther] = useState('');
  const [seats, setSeats] = useState('');
  const [isVan, setIsVan] = useState(false);
  const [mileage, setMileage] = useState('');
  const [firstRegisteredAt, setFirstRegisteredAt] = useState('');
  const [ownerKmPerYear, setOwnerKmPerYear] = useState('');
  const [purchaseAmountInclVat, setPurchaseAmountInclVat] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [simulationResult, setSimulationResult] = useState<{
    resultCode: SimulationResultCode;
    message?: string;
  } | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(0);
  const [fuelTypes, setFuelTypes] = useState<{ id: string; name: string }[]>([]);
  const [fuelTypesLoading, setFuelTypesLoading] = useState(true);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const simulationRequestInFlight = useRef(false);
  const t = useTranslations('simulation.wizard');

  const isSuccessResult =
    simulationResult &&
    (simulationResult.resultCode === SimulationResultCode.CATEGORY_A ||
      simulationResult.resultCode === SimulationResultCode.CATEGORY_B ||
      simulationResult.resultCode === SimulationResultCode.HIGHER_RATE);
  const isNotOkResult = simulationResult && simulationResult.resultCode === SimulationResultCode.NOT_OK;
  const isUnclearResult = simulationResult && simulationResult.resultCode === SimulationResultCode.MANUAL_REVIEW;

  useEffect(() => {
    if (step !== STEP_LOADING) return;
    setLoadingMessageIndex(0);
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % 10);
    }, 2500);
    return () => clearInterval(interval);
  }, [step]);

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
    if (computedOwnerKmPerYear !== null && !ownerKmPerYear.trim()) {
      setOwnerKmPerYear(String(computedOwnerKmPerYear));
    }
  }, [computedOwnerKmPerYear, ownerKmPerYear]);

  const effectiveOwnerKmPerYear = useMemo(() => {
    if (ownerKmPerYear.trim()) {
      const n = parseInt(ownerKmPerYear.trim(), 10);
      return Number.isInteger(n) && n >= 0 ? n : null;
    }
    return computedOwnerKmPerYear;
  }, [ownerKmPerYear, computedOwnerKmPerYear]);

  useEffect(() => {
    if (step !== STEP_LOADING || simulationRequestInFlight.current) return;

    const isNewCar = carChoice === 'new';
    const seatsNum = parseInt(seats.trim(), 10) || 1;
    const firstRegisteredAtValue = isNewCar
      ? new Date().toISOString().slice(0, 10)
      : firstRegisteredAt.trim() || new Date().toISOString().slice(0, 10);
    const mileageNum = isNewCar ? 0 : parseInt(mileage.trim(), 10) || 0;
    const ownerKmNum = isNewCar ? 0 : (effectiveOwnerKmPerYear ?? 0);
    const purchasePriceValue = isNewCar && purchaseAmountInclVat.trim() ? parseFloat(purchaseAmountInclVat.replace(/,/g, '.')) : null;

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
      purchasePrice: purchasePriceValue,
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
        });
        setStep(STEP_RESULTS);
      })
      .catch((err: Error) => {
        simulationRequestInFlight.current = false;
        setSimulationError(err.message ?? 'An error occurred');
      });
  }, [
    step,
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

  const isMileageNewCarValid = useMemo(() => {
    const amount = purchaseAmountInclVat.trim() ? parseFloat(purchaseAmountInclVat.replace(/,/g, '.')) : NaN;
    return Number.isFinite(amount) && amount > 0;
  }, [purchaseAmountInclVat]);

  const isMileageExistingCarValid = useMemo(() => {
    const mileageNum = mileage.trim() ? parseInt(mileage.trim(), 10) : NaN;
    const date = firstRegistrationDateToDate(firstRegisteredAt);
    if (!Number.isInteger(mileageNum) || mileageNum < 0) return false;
    if (!date || date > new Date()) return false;
    return effectiveOwnerKmPerYear !== null && effectiveOwnerKmPerYear >= 0;
  }, [mileage, firstRegisteredAt, effectiveOwnerKmPerYear]);

  const carTypeQueryParams = useMemo(
    () => (brandId && fuelTypeId ? { brandId, fuelTypeId, isActive: 'true' } : undefined),
    [brandId, fuelTypeId],
  );

  const isCarDetailsValid = useMemo(() => {
    if (!brandId || !fuelTypeId || !carTypeId) return false;
    if (carTypeId === CAR_TYPE_OTHER && !carTypeOther.trim()) return false;
    const seatsNum = parseInt(seats.trim(), 10);
    if (!Number.isInteger(seatsNum) || seatsNum < 1) return false;
    return true;
  }, [brandId, fuelTypeId, carTypeId, carTypeOther, seats]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/fuel-types?isActive=true');
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setFuelTypes(
            (data.records ?? []).map((r: { id: string; name: string }) => ({
              id: r.id,
              name: r.name,
            })),
          );
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

  return (
    <main className="bg-muted/60 flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center py-8">
      <div className="container mx-auto w-full max-w-xl px-4">
        {step === STEP_INTRO && (
          <div className="space-y-12 text-center">
            <h1 className="text-4xl font-semibold">{t('intro.title')}</h1>
            <p className="text-muted-foreground mx-auto max-w-md text-base leading-relaxed">{t('intro.body')}</p>
            <Button onClick={() => setStep(STEP_CAR_CHOICE)} size="lg" className={accentButtonClass}>
              {t('intro.getStarted')}
            </Button>
          </div>
        )}

        {step === STEP_CAR_CHOICE && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold">{t('carChoice.title')}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{t('carChoice.subtitle')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label={t('carChoice.title')}>
              <Card
                className={
                  'relative cursor-pointer transition-colors ' +
                  'hover:border-emerald-500/50 ' +
                  (carChoice === 'new' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-card')
                }
                role="radio"
                tabIndex={0}
                aria-checked={carChoice === 'new'}
                onClick={() => setCarChoice('new')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCarChoice('new');
                  }
                }}
              >
                <div
                  className={
                    'absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border-2 ' +
                    (carChoice === 'new' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/30 bg-transparent')
                  }
                  aria-hidden
                >
                  {carChoice === 'new' && <Check className="size-3 shrink-0" strokeWidth={3} />}
                </div>
                <CardHeader className="flex flex-col items-start gap-3 pb-2">
                  <div className="text-muted-foreground">
                    <CarFront className="size-10" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-base leading-tight font-semibold">{t('carChoice.newCar')}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{t('carChoice.newCarDescription')}</CardDescription>
                </CardHeader>
              </Card>
              <Card
                className={
                  'relative cursor-pointer transition-colors ' +
                  'hover:border-emerald-500/50 ' +
                  (carChoice === 'existing' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-card')
                }
                role="radio"
                tabIndex={0}
                aria-checked={carChoice === 'existing'}
                onClick={() => setCarChoice('existing')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCarChoice('existing');
                  }
                }}
              >
                <div
                  className={
                    'absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border-2 ' +
                    (carChoice === 'existing' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/30 bg-transparent')
                  }
                  aria-hidden
                >
                  {carChoice === 'existing' && <Check className="size-3 shrink-0" strokeWidth={3} />}
                </div>
                <CardHeader className="flex flex-col items-start gap-3 pb-2">
                  <div className="text-muted-foreground">
                    <Car className="size-10" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-base leading-tight font-semibold">{t('carChoice.existingCar')}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{t('carChoice.existingCarDescription')}</CardDescription>
                </CardHeader>
              </Card>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep(STEP_INTRO)}>
                {t('town.back')}
              </Button>
              <Button size="sm" disabled={!carChoice} onClick={() => setStep(STEP_TOWN)} className={accentButtonClass}>
                {t('carChoice.continue')}
              </Button>
            </div>
          </div>
        )}

        {step === STEP_TOWN && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">{t('town.title')}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{t('town.description')}</p>
            </div>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Field>
                    <FieldLabel>{t('town.label')}</FieldLabel>
                    <SearchableSelect
                      value={townId}
                      selectedLabel={townLabel || undefined}
                      onValueChange={(id, option) => {
                        setTownId(id);
                        setTownLabel(option.name);
                      }}
                      apiPath="towns"
                      labelKey="displayLabel"
                      placeholder={t('town.searchPlaceholder')}
                    />
                  </Field>
                  <div>
                    <button
                      type="button"
                      onClick={() => setCantSeeTownExpanded((v) => !v)}
                      className="text-muted-foreground hover:text-muted-foreground/80 inline-flex items-center gap-1.5 text-xs transition-colors"
                    >
                      <Info className="size-3.5 shrink-0 opacity-70" />
                      {t('town.cantSeeTown')}
                      {cantSeeTownExpanded ? <ChevronUp className="size-3.5 shrink-0" /> : <ChevronDown className="size-3.5 shrink-0" />}
                    </button>
                    {cantSeeTownExpanded && <p className="text-muted-foreground mt-2 text-sm">{t('town.cantSeeTownHelper')}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep(STEP_CAR_CHOICE)}>
                {t('town.back')}
              </Button>
              <Button size="sm" disabled={!townId} onClick={() => setStep(STEP_CAR_DETAILS)} className={accentButtonClass}>
                {t('town.continue')}
              </Button>
            </div>
          </div>
        )}

        {step === STEP_CAR_DETAILS && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">{t('carDetails.title')}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{t('carDetails.description')}</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <FieldGroup className="gap-6">
                  <Field>
                    <FieldLabel>{t('carDetails.brand')}</FieldLabel>
                    <SearchableSelect
                      value={brandId}
                      selectedLabel={brandLabel || undefined}
                      onValueChange={(id, option) => {
                        setBrandId(id);
                        setBrandLabel(option.name);
                        if (carTypeId) {
                          setCarTypeId('');
                          setCarTypeName('');
                          setCarTypeOther('');
                        }
                      }}
                      apiPath="car-brands"
                      queryParams={{ isActive: 'true' }}
                      placeholder={t('carDetails.brandPlaceholder')}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t('carDetails.fuelType')}</FieldLabel>
                    <Select
                      value={fuelTypeId || undefined}
                      onValueChange={(v) => {
                        setFuelTypeId(v);
                        setFuelTypeName(fuelTypes.find((f) => f.id === v)?.name ?? '');
                        if (carTypeId) {
                          setCarTypeId('');
                          setCarTypeName('');
                          setCarTypeOther('');
                        }
                      }}
                      disabled={fuelTypesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('carDetails.fuelTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes
                          .filter((f) => f.id)
                          .map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>{t('carDetails.carType')}</FieldLabel>
                    <SearchableSelect
                      value={carTypeId}
                      selectedLabel={carTypeId === CAR_TYPE_OTHER ? t('carDetails.carTypeOtherOption') : carTypeName || undefined}
                      onValueChange={(id, option) => {
                        setCarTypeId(id);
                        setCarTypeName(option.name);
                        if (id !== CAR_TYPE_OTHER) setCarTypeOther('');
                      }}
                      apiPath="car-types"
                      queryParams={carTypeQueryParams}
                      appendOptions={
                        brandId && fuelTypeId
                          ? [
                              {
                                id: CAR_TYPE_OTHER,
                                name: t('carDetails.carTypeOtherOption'),
                              },
                            ]
                          : []
                      }
                      placeholder={brandId && fuelTypeId ? t('carDetails.carTypePlaceholder') : t('carDetails.carTypePlaceholderFirst')}
                      disabled={!brandId || !fuelTypeId}
                    />
                  </Field>
                  {carTypeId === CAR_TYPE_OTHER && (
                    <Field>
                      <FieldLabel>{t('carDetails.carTypeOther')}</FieldLabel>
                      <Input
                        value={carTypeOther}
                        onChange={(e) => setCarTypeOther(e.target.value)}
                        placeholder={t('carDetails.carTypeOtherPlaceholder')}
                      />
                    </Field>
                  )}
                  <Field>
                    <FieldLabel>{t('carDetails.seats')}</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      placeholder={t('carDetails.seatsPlaceholder')}
                    />
                  </Field>
                  <Field orientation="horizontal">
                    <Switch id="simulation-isVan" checked={isVan} onCheckedChange={(checked) => setIsVan(checked === true)} />
                    <FieldLabel htmlFor="simulation-isVan" className="cursor-pointer font-normal">
                      {t('carDetails.isVan')}
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep(STEP_TOWN)}>
                {t('carDetails.back')}
              </Button>
              <Button size="sm" disabled={!isCarDetailsValid} onClick={() => setStep(STEP_MILEAGE)} className={accentButtonClass}>
                {t('carDetails.continue')}
              </Button>
            </div>
          </div>
        )}

        {step === STEP_MILEAGE && carChoice === 'new' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">{t('mileage.newCarTitle')}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{t('mileage.newCarDescription')}</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <FieldGroup className="gap-6">
                  <Field>
                    <FieldLabel>{t('mileage.purchaseAmountInclVat')}</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={purchaseAmountInclVat}
                      onChange={(e) => setPurchaseAmountInclVat(e.target.value)}
                      placeholder={t('mileage.purchaseAmountPlaceholder')}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep(STEP_CAR_DETAILS)}>
                {t('mileage.back')}
              </Button>
              <Button size="sm" disabled={!isMileageNewCarValid} onClick={() => setStep(STEP_LOADING)} className={accentButtonClass}>
                {t('mileage.continue')}
              </Button>
            </div>
          </div>
        )}

        {step === STEP_MILEAGE && carChoice === 'existing' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">{t('mileage.title')}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{t('mileage.description')}</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <FieldGroup className="gap-6">
                  <Field>
                    <FieldLabel>{t('mileage.mileage')}</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder={t('mileage.mileagePlaceholder')}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t('mileage.firstRegistrationDate')}</FieldLabel>
                    <FirstRegistrationDatePicker
                      value={firstRegisteredAt}
                      onChange={setFirstRegisteredAt}
                      placeholder={t('mileage.pickDate')}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t('mileage.ownerKmPerYear')}</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={ownerKmPerYear}
                      onChange={(e) => setOwnerKmPerYear(e.target.value)}
                      placeholder={computedOwnerKmPerYear !== null ? String(computedOwnerKmPerYear) : undefined}
                    />
                    <p className="text-muted-foreground text-xs">
                      {computedOwnerKmPerYear !== null ? t('mileage.ownerKmPerYearHint') : t('mileage.ownerKmPerYearEmpty')}
                    </p>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setStep(STEP_CAR_DETAILS)}>
                {t('mileage.back')}
              </Button>
              <Button size="sm" disabled={!isMileageExistingCarValid} onClick={() => setStep(STEP_LOADING)} className={accentButtonClass}>
                {t('mileage.continue')}
              </Button>
            </div>
          </div>
        )}

        {step === STEP_LOADING && (
          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
                {simulationError ? (
                  <div className="space-y-4 text-center">
                    <p className="text-destructive font-medium">{t('loading.errorTitle')}</p>
                    <p className="text-muted-foreground text-sm">{simulationError}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSimulationError(null);
                          setStep(STEP_INTRO);
                        }}
                      >
                        {t('results.restart')}
                      </Button>
                      <Button
                        size="sm"
                        className={accentButtonClass}
                        onClick={() => {
                          setSimulationError(null);
                          simulationRequestInFlight.current = false;
                          setLoadingAttempt((a) => a + 1);
                        }}
                      >
                        {t('loading.retry')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Loader2 className="size-12 animate-spin text-emerald-600" />
                    <div className="text-center">
                      <p className="font-medium">{t('loading.title')}</p>
                      <p className="text-muted-foreground mt-1 text-sm">{t(`loading.funny${loadingMessageIndex + 1}` as 'loading.funny1')}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === STEP_RESULTS && simulationResult && (
          <div className="space-y-12 text-center">
            <div>
              {isSuccessResult && (
                <>
                  <h2 className="text-2xl font-semibold">{t('results.successTitle')}</h2>
                  <CheckCircle2 className="mx-auto mt-4 size-16 text-emerald-600" />
                  <p className="text-muted-foreground mx-auto mt-4 max-w-md text-base leading-relaxed">{t('results.successBody')}</p>
                </>
              )}
              {isNotOkResult && (
                <>
                  <h2 className="text-2xl font-semibold">{t('results.notOkTitle')}</h2>
                  <XCircle className="text-destructive mx-auto mt-4 size-16" />
                  <p className="text-muted-foreground mx-auto mt-4 max-w-md text-base leading-relaxed">{t('results.notOkBody')}</p>
                  {simulationResult.message && (
                    <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">{simulationResult.message}</p>
                  )}
                </>
              )}
              {isUnclearResult && (
                <>
                  <h2 className="text-2xl font-semibold">{t('results.unclearTitle')}</h2>
                  <HelpCircle className="text-muted-foreground mx-auto mt-4 size-16" />
                  <p className="text-muted-foreground mx-auto mt-4 max-w-md text-base leading-relaxed">{t('results.unclearBody')}</p>
                </>
              )}
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSimulationResult(null);
                    setStep(STEP_INTRO);
                  }}
                >
                  <RotateCcw className="mr-2 size-4" />
                  {t('results.restart')}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/faq">
                    <HelpCircle className="mr-2 size-4" />
                    {t('results.iHaveAQuestion')}
                  </Link>
                </Button>
              </div>
              {isSuccessResult && (
                <Button size="lg" className={accentButtonClass} onClick={() => setEnrollModalOpen(true)}>
                  {t('results.enrollInFleet')}
                </Button>
              )}
              {isUnclearResult && (
                <Button size="lg" className={accentButtonClass} onClick={() => {}}>
                  {t('results.askManualReview')}
                </Button>
              )}
            </div>
          </div>
        )}

        <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('results.enrollModalTitle')}</DialogTitle>
              <DialogDescription>{t('results.enrollModalBody')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEnrollModalOpen(false)}>
                {t('results.enrollModalClose')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
