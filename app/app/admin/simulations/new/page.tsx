'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon, Check, Info, X } from 'lucide-react';

import type { Simulation, SimulationStep } from '@/domain/simulation.model';
import { SimulationStepStatus } from '@/domain/simulation.model';
import { calculateOwnerKmPerYear } from '@/domain/utils';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Switch } from '@/app/components/ui/switch';
import { Field, FieldGroup, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { SearchableSelect } from '@/app/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Skeleton } from '@/app/components/ui/skeleton';

const PREVIEW_DEBOUNCE_MS = 400;

interface SimulationFormState {
  townId: string;
  townName: string;
  brandId: string;
  brandName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  carTypeId: string;
  carTypeName: string;
  carTypeOther: string;
  mileage: string;
  seats: string;
  firstRegisteredAt: string;
  isVan: boolean;
  ownerKmPerYear: string;
}

const defaultFormState: SimulationFormState = {
  townId: '',
  townName: '',
  brandId: '',
  brandName: '',
  fuelTypeId: '',
  fuelTypeName: '',
  carTypeId: '',
  carTypeName: '',
  carTypeOther: '',
  mileage: '',
  seats: '',
  firstRegisteredAt: '',
  isVan: false,
  ownerKmPerYear: '',
};

function firstRegistrationDateToDate(value: string): Date | undefined {
  if (!value.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

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
  const date = firstRegistrationDateToDate(value);
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

function StepIcon({ status }: { status: SimulationStep['status'] }) {
  switch (status) {
    case SimulationStepStatus.OK:
      return <Check className="size-4 text-green-600" />;
    case SimulationStepStatus.NOT_OK:
      return <X className="size-4 text-red-600" />;
    case SimulationStepStatus.INFO:
      return <Info className="text-muted-foreground size-4" />;
    default:
      return null;
  }
}

const CAR_TYPE_OTHER = '__other__';

function isFormValidForPreview(form: SimulationFormState): boolean {
  const townId = form.townId.trim();
  const brandId = form.brandId.trim();
  const fuelTypeId = form.fuelTypeId.trim();
  const mileage = form.mileage.trim() ? parseInt(form.mileage, 10) : NaN;
  const seats = form.seats.trim() ? parseInt(form.seats, 10) : NaN;
  const firstRegisteredAt = form.firstRegisteredAt.trim();
  if (!townId || !brandId || !fuelTypeId) return false;
  if (form.carTypeId === CAR_TYPE_OTHER && !form.carTypeOther.trim()) return false;
  if (!Number.isInteger(mileage) || mileage < 0) return false;
  if (!Number.isInteger(seats) || seats < 1) return false;
  if (!firstRegisteredAt) return false;
  const date = new Date(firstRegisteredAt);
  if (Number.isNaN(date.getTime())) return false;
  const computed = calculateOwnerKmPerYear(mileage, date);
  const ownerKmPerYear = form.ownerKmPerYear.trim() ? parseInt(form.ownerKmPerYear, 10) : computed;
  return Number.isInteger(ownerKmPerYear) && ownerKmPerYear >= 0;
}

function buildRequestBody(form: SimulationFormState): Record<string, unknown> {
  const mileage = parseInt(form.mileage, 10);
  const seats = parseInt(form.seats, 10);
  const firstRegisteredAt = new Date(form.firstRegisteredAt);
  const computedOwnerKmPerYear = calculateOwnerKmPerYear(mileage, firstRegisteredAt);
  const ownerKmPerYear = form.ownerKmPerYear.trim() ? parseInt(form.ownerKmPerYear, 10) : computedOwnerKmPerYear;
  return {
    town: { id: form.townId.trim(), name: form.townName || undefined },
    brand: { id: form.brandId.trim(), name: form.brandName || undefined },
    fuelType: { id: form.fuelTypeId.trim(), name: form.fuelTypeName || undefined },
    carType: form.carTypeId && form.carTypeId !== CAR_TYPE_OTHER ? { id: form.carTypeId.trim(), name: form.carTypeName || undefined } : null,
    carTypeOther: form.carTypeId === CAR_TYPE_OTHER ? form.carTypeOther.trim() || null : null,
    mileage,
    ownerKmPerYear,
    seats,
    firstRegisteredAt: firstRegisteredAt.toISOString(),
    isVan: form.isVan,
  };
}

export default function NewSimulationPage() {
  const router = useRouter();
  const tForm = useTranslations('simulation.form');
  const tNew = useTranslations('admin.simulations.newPage');
  const tResult = useTranslations('simulation.resultCode');

  const [fuelTypes, setFuelTypes] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<SimulationFormState>(defaultFormState);
  const [preview, setPreview] = useState<Simulation | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isLoadingFuelTypes, setIsLoadingFuelTypes] = useState(true);
  const [userHasEditedOwnerKmPerYear, setUserHasEditedOwnerKmPerYear] = useState(false);

  const carTypeQueryParams = useMemo(
    () => (form.brandId && form.fuelTypeId ? { brandId: form.brandId, fuelTypeId: form.fuelTypeId, isActive: 'true' } : undefined),
    [form.brandId, form.fuelTypeId],
  );

  const computedOwnerKmPerYear = useMemo(() => {
    const mileage = form.mileage.trim() ? parseInt(form.mileage, 10) : NaN;
    const date = firstRegistrationDateToDate(form.firstRegisteredAt);
    if (!Number.isInteger(mileage) || mileage < 0 || !date) return null;
    return calculateOwnerKmPerYear(mileage, date);
  }, [form.mileage, form.firstRegisteredAt]);

  useEffect(() => {
    if (userHasEditedOwnerKmPerYear) return;
    setForm((prev) => ({
      ...prev,
      ownerKmPerYear: computedOwnerKmPerYear != null ? String(computedOwnerKmPerYear) : '',
    }));
  }, [computedOwnerKmPerYear, userHasEditedOwnerKmPerYear]);

  const updateForm = useCallback((updates: Partial<SimulationFormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (updates.brandId !== undefined || updates.fuelTypeId !== undefined) {
        next.carTypeId = '';
        next.carTypeName = '';
      }
      return next;
    });
    setPreviewError(null);
    setCreateError(null);
  }, []);

  // Debounced preview: run simulation with skipPersistence when form is valid
  useEffect(() => {
    if (!isFormValidForPreview(form)) {
      setPreview(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    setIsPreviewLoading(true);
    const timer = setTimeout(async () => {
      setPreviewError(null);
      try {
        const body = buildRequestBody(form);
        const res = await fetch('/api/simulations?skipPersistence=true', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok) {
          const msg = data?.errors?.[0]?.message ?? data?.code ?? tForm('errorRequestFailed');
          setPreviewError(msg);
          setPreview(null);
          return;
        }

        setPreview(data as Simulation);
      } catch {
        setPreviewError(tForm('errorRequestFailed'));
        setPreview(null);
      } finally {
        setIsPreviewLoading(false);
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      setIsPreviewLoading(false);
    };
  }, [form, tForm]);

  const handleCreate = useCallback(async () => {
    if (!isFormValidForPreview(form)) return;

    setCreateError(null);
    setIsCreating(true);
    try {
      const body = buildRequestBody(form);
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data?.errors?.[0]?.message ?? data?.code ?? tForm('errorRequestFailed');
        setCreateError(msg);
        return;
      }

      router.push('/app/admin/simulations');
    } catch {
      setCreateError(tForm('errorRequestFailed'));
    } finally {
      setIsCreating(false);
    }
  }, [form, router, tForm]);

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
        if (!cancelled) setIsLoadingFuelTypes(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/simulations">{tNew('backToSimulations')}</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tNew('title')}</CardTitle>
            <CardDescription>{tNew('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>{tForm('town')}</FieldLabel>
                <SearchableSelect
                  value={form.townId}
                  selectedLabel={form.townName || undefined}
                  onValueChange={(id, option) => updateForm({ townId: id, townName: option.name })}
                  apiPath="towns"
                  labelKey="displayLabel"
                  placeholder={tForm('townPlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{tForm('brand')}</FieldLabel>
                <SearchableSelect
                  value={form.brandId}
                  selectedLabel={form.brandName || undefined}
                  onValueChange={(id, option) => updateForm({ brandId: id, brandName: option.name })}
                  apiPath="car-brands"
                  queryParams={{ isActive: 'true' }}
                  placeholder={tForm('brandPlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{tForm('fuelType')}</FieldLabel>
                <Select
                  value={form.fuelTypeId || undefined}
                  onValueChange={(v) =>
                    updateForm({
                      fuelTypeId: v,
                      fuelTypeName: fuelTypes.find((f) => f.id === v)?.name ?? '',
                    })
                  }
                  disabled={isLoadingFuelTypes}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tForm('fuelTypePlaceholder')} />
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
                <FieldLabel>{tForm('carType')}</FieldLabel>
                <SearchableSelect
                  value={form.carTypeId}
                  selectedLabel={
                    form.carTypeId === CAR_TYPE_OTHER ? form.carTypeOther.trim() || tForm('carTypeOtherOption') : form.carTypeName || undefined
                  }
                  onValueChange={(id, option) => updateForm({ carTypeId: id, carTypeName: option.name })}
                  apiPath="car-types"
                  queryParams={carTypeQueryParams}
                  appendOptions={form.brandId && form.fuelTypeId ? [{ id: CAR_TYPE_OTHER, name: tForm('carTypeOtherOption') }] : []}
                  placeholder={form.brandId && form.fuelTypeId ? tForm('carTypePlaceholder') : tForm('carTypePlaceholderFirst')}
                  disabled={!form.brandId || !form.fuelTypeId}
                />
              </Field>

              {form.carTypeId === CAR_TYPE_OTHER && (
                <Field>
                  <FieldLabel>{tForm('carTypeOther')}</FieldLabel>
                  <Input
                    value={form.carTypeOther}
                    onChange={(e) => updateForm({ carTypeOther: e.target.value })}
                    placeholder={tForm('carTypeOtherPlaceholder')}
                  />
                </Field>
              )}

              <Field orientation="horizontal">
                <Switch id="new-simulation-isVan" checked={form.isVan} onCheckedChange={(checked) => updateForm({ isVan: checked === true })} />
                <FieldLabel htmlFor="new-simulation-isVan" className="cursor-pointer font-normal">
                  {tForm('isVan')}
                </FieldLabel>
              </Field>

              <Field>
                <FieldLabel>{tForm('mileage')}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.mileage}
                  onChange={(e) => updateForm({ mileage: e.target.value })}
                  placeholder={tForm('mileagePlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{tForm('seats')}</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.seats}
                  onChange={(e) => updateForm({ seats: e.target.value })}
                  placeholder={tForm('seatsPlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{tForm('firstRegistrationDate')}</FieldLabel>
                <FirstRegistrationDatePicker
                  value={form.firstRegisteredAt}
                  onChange={(value) => updateForm({ firstRegisteredAt: value })}
                  placeholder={tForm('pickDate')}
                />
              </Field>

              <Field>
                <FieldLabel>{tForm('ownerKmPerYear')}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.ownerKmPerYear}
                  onChange={(e) => {
                    updateForm({ ownerKmPerYear: e.target.value });
                    setUserHasEditedOwnerKmPerYear(true);
                  }}
                  placeholder={tForm('ownerKmPerYearPlaceholder')}
                />
              </Field>

              {createError && (
                <div role="alert" className="text-destructive text-sm">
                  {createError}
                </div>
              )}

              <Button type="button" onClick={handleCreate} disabled={isCreating || !isFormValidForPreview(form)}>
                {isCreating ? tNew('creating') : tNew('create')}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tNew('resultTitle')}</CardTitle>
            <CardDescription>
              {preview ? tResult(preview.resultCode) : isPreviewLoading ? tForm('submitting') : previewError ? previewError : tNew('noResult')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPreviewLoading ? (
              <ul className="space-y-2" aria-busy="true" aria-label={tForm('submitting')}>
                <li className="flex items-center gap-2 text-sm">
                  <Skeleton className="size-4 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-full flex-1" />
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Skeleton className="size-4 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-4/5 flex-1" />
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Skeleton className="size-4 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-3/4 flex-1" />
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Skeleton className="size-4 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-2/3 flex-1" />
                </li>
              </ul>
            ) : preview && preview.steps.length > 0 ? (
              <ul className="space-y-2">
                {preview.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <StepIcon status={step.status} />
                    <span>{step.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">{previewError ?? tNew('noResult')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
