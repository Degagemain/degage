'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon, Check, Info, X } from 'lucide-react';

import type { Simulation, SimulationStep } from '@/domain/simulation.model';
import { SimulationStepStatus } from '@/domain/simulation.model';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Switch } from '@/app/components/ui/switch';
import { Field, FieldGroup, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { SearchableSelect } from '@/app/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

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
  km: string;
  seats: string;
  firstRegisteredAt: string;
  isVan: boolean;
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
  km: '',
  seats: '',
  firstRegisteredAt: '',
  isVan: false,
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

export default function SimulationPage() {
  const t = useTranslations('simulation.form');
  const [fuelTypes, setFuelTypes] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<SimulationFormState>(defaultFormState);
  const [result, setResult] = useState<Simulation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFuelTypes, setIsLoadingFuelTypes] = useState(true);

  const CAR_TYPE_OTHER = '__other__';

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

  const updateForm = useCallback((updates: Partial<SimulationFormState>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      if (updates.brandId !== undefined || updates.fuelTypeId !== undefined) {
        next.carTypeId = '';
        next.carTypeName = '';
      }
      return next;
    });
    setError(null);
  }, []);

  const carTypeQueryParams = useMemo(
    () => (form.brandId && form.fuelTypeId ? { brandId: form.brandId, fuelTypeId: form.fuelTypeId, isActive: 'true' } : undefined),
    [form.brandId, form.fuelTypeId],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setResult(null);

      const townId = form.townId.trim();
      const brandId = form.brandId.trim();
      const fuelTypeId = form.fuelTypeId.trim();
      const km = form.km.trim() ? parseInt(form.km, 10) : NaN;
      const seats = form.seats.trim() ? parseInt(form.seats, 10) : NaN;
      const firstRegisteredAt = form.firstRegisteredAt.trim();

      if (!townId) {
        setError(t('errorSelectTown'));
        return;
      }
      if (!brandId) {
        setError(t('errorSelectBrand'));
        return;
      }
      if (!fuelTypeId) {
        setError(t('errorSelectFuelType'));
        return;
      }
      if (form.carTypeId === CAR_TYPE_OTHER && !form.carTypeOther.trim()) {
        setError(t('errorCarTypeOtherRequired'));
        return;
      }
      if (!Number.isInteger(km) || km < 0) {
        setError(t('errorValidMileage'));
        return;
      }
      if (!Number.isInteger(seats) || seats < 1) {
        setError(t('errorValidSeats'));
        return;
      }
      if (!firstRegisteredAt) {
        setError(t('errorEnterDate'));
        return;
      }

      const date = new Date(firstRegisteredAt);
      if (Number.isNaN(date.getTime())) {
        setError(t('errorValidDate'));
        return;
      }

      setIsSubmitting(true);
      try {
        const body = {
          town: { id: townId, name: form.townName || undefined },
          brand: { id: brandId, name: form.brandName || undefined },
          fuelType: { id: fuelTypeId, name: form.fuelTypeName || undefined },
          carType:
            form.carTypeId && form.carTypeId !== CAR_TYPE_OTHER ? { id: form.carTypeId.trim(), name: form.carTypeName || undefined } : null,
          carTypeOther: form.carTypeId === CAR_TYPE_OTHER ? form.carTypeOther.trim() || null : null,
          km,
          seats,
          firstRegisteredAt: date.toISOString(),
          isVan: form.isVan,
        };
        const res = await fetch('/api/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (!res.ok) {
          const msg = data?.errors?.[0]?.message ?? data?.code ?? t('errorRequestFailed');
          setError(msg);
          return;
        }

        setResult(data as Simulation);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errorRequestFailed'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, t],
  );

  const tResult = useTranslations('simulation.resultCode');

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app">{t('backToDashboard')}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel>{t('town')}</FieldLabel>
                <SearchableSelect
                  value={form.townId}
                  selectedLabel={form.townName || undefined}
                  onValueChange={(id, option) => updateForm({ townId: id, townName: option.name })}
                  apiPath="towns"
                  labelKey="displayLabel"
                  placeholder={t('townPlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{t('brand')}</FieldLabel>
                <SearchableSelect
                  value={form.brandId}
                  selectedLabel={form.brandName || undefined}
                  onValueChange={(id, option) => updateForm({ brandId: id, brandName: option.name })}
                  apiPath="car-brands"
                  queryParams={{ isActive: 'true' }}
                  placeholder={t('brandPlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{t('fuelType')}</FieldLabel>
                <Select
                  value={form.fuelTypeId || undefined}
                  onValueChange={(v) => updateForm({ fuelTypeId: v, fuelTypeName: fuelTypes.find((f) => f.id === v)?.name ?? '' })}
                  disabled={isLoadingFuelTypes}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('fuelTypePlaceholder')} />
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
                <FieldLabel>{t('carType')}</FieldLabel>
                <SearchableSelect
                  value={form.carTypeId}
                  selectedLabel={
                    form.carTypeId === CAR_TYPE_OTHER ? form.carTypeOther.trim() || t('carTypeOtherOption') : form.carTypeName || undefined
                  }
                  onValueChange={(id, option) => updateForm({ carTypeId: id, carTypeName: option.name })}
                  apiPath="car-types"
                  queryParams={carTypeQueryParams}
                  appendOptions={form.brandId && form.fuelTypeId ? [{ id: CAR_TYPE_OTHER, name: t('carTypeOtherOption') }] : []}
                  placeholder={form.brandId && form.fuelTypeId ? t('carTypePlaceholder') : t('carTypePlaceholderFirst')}
                  disabled={!form.brandId || !form.fuelTypeId}
                />
              </Field>

              {form.carTypeId === CAR_TYPE_OTHER && (
                <Field>
                  <FieldLabel>{t('carTypeOther')}</FieldLabel>
                  <Input
                    value={form.carTypeOther}
                    onChange={(e) => updateForm({ carTypeOther: e.target.value })}
                    placeholder={t('carTypeOtherPlaceholder')}
                  />
                </Field>
              )}

              <Field orientation="horizontal">
                <Switch id="simulation-isVan" checked={form.isVan} onCheckedChange={(checked) => updateForm({ isVan: checked === true })} />
                <FieldLabel htmlFor="simulation-isVan" className="cursor-pointer font-normal">
                  {t('isVan')}
                </FieldLabel>
              </Field>

              <Field>
                <FieldLabel>{t('mileage')}</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.km}
                  onChange={(e) => updateForm({ km: e.target.value })}
                  placeholder={t('mileagePlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{t('seats')}</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.seats}
                  onChange={(e) => updateForm({ seats: e.target.value })}
                  placeholder={t('seatsPlaceholder')}
                />
              </Field>

              <Field>
                <FieldLabel>{t('firstRegistrationDate')}</FieldLabel>
                <FirstRegistrationDatePicker
                  value={form.firstRegisteredAt}
                  onChange={(value) => updateForm({ firstRegisteredAt: value })}
                  placeholder={t('pickDate')}
                />
              </Field>

              {error && (
                <div role="alert" className="text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {result && result.steps.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('resultTitle')}</CardTitle>
            <CardDescription>{tResult(result.resultCode)}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.steps.map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <StepIcon status={step.status} />
                  <span>{step.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
