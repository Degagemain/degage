'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Check, Info, X } from 'lucide-react';

import type { Simulation, SimulationStep } from '@/domain/simulation.model';
import { SimulationStepIcon } from '@/domain/simulation.model';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';

function StepIcon({ status }: { status: SimulationStep['status'] }) {
  switch (status) {
    case SimulationStepIcon.OK:
      return <Check className="size-4 shrink-0 text-green-600" />;
    case SimulationStepIcon.NOT_OK:
      return <X className="size-4 shrink-0 text-red-600" />;
    case SimulationStepIcon.INFO:
      return <Info className="text-muted-foreground size-4 shrink-0" />;
    default:
      return null;
  }
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-2 text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="font-mono text-sm">{value ?? '—'}</span>
    </div>
  );
}

export default function SimulationDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null;
  const tForm = useTranslations('simulation.form');
  const tCol = useTranslations('admin.simulations.columns');
  const tResult = useTranslations('simulation.resultCode');
  const tDetail = useTranslations('admin.simulations.detailPage');

  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSimulation = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/simulations/${id}`);
      if (!res.ok) {
        if (res.status === 404) setError('Simulation not found');
        else setError('Failed to load simulation');
        setSimulation(null);
        return;
      }
      const data = await res.json();
      setSimulation(data as Simulation);
    } catch {
      setError('Failed to load simulation');
      setSimulation(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSimulation();
  }, [fetchSimulation]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex gap-2">
                    <Skeleton className="size-4 shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/simulations">{tDetail('backToSimulations')}</Link>
        </Button>
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchSimulation}>
            {tDetail('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  const firstRegisteredAt =
    simulation.firstRegisteredAt instanceof Date
      ? simulation.firstRegisteredAt
      : simulation.firstRegisteredAt
        ? new Date(simulation.firstRegisteredAt)
        : null;
  const createdAt = simulation.createdAt instanceof Date ? simulation.createdAt : simulation.createdAt ? new Date(simulation.createdAt) : null;
  const updatedAt = simulation.updatedAt instanceof Date ? simulation.updatedAt : simulation.updatedAt ? new Date(simulation.updatedAt) : null;

  return (
    <div className="flex flex-col gap-4 px-3 py-4 md:px-4">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/admin/simulations">{tDetail('backToSimulations')}</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tDetail('title')}</CardTitle>
            <CardDescription>
              {tDetail('description')} {tResult(simulation.resultCode)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <FieldRow label={tForm('town')} value={simulation.town?.name} />
            <FieldRow label={tCol('resultCode')} value={tResult(simulation.resultCode)} />
            <FieldRow label={tForm('brand')} value={simulation.brand?.name} />
            <FieldRow label={tForm('fuelType')} value={simulation.fuelType?.name} />
            <FieldRow
              label={tForm('carType')}
              value={simulation.carType?.name ?? (simulation.carTypeOther ? `Other: ${simulation.carTypeOther}` : null)}
            />
            {simulation.carTypeOther && <FieldRow label={tCol('carTypeOther')} value={simulation.carTypeOther} />}
            <FieldRow label={tCol('mileage')} value={simulation.mileage.toLocaleString()} />
            <FieldRow label={tForm('ownerKmPerYear')} value={simulation.ownerKmPerYear.toLocaleString()} />
            <FieldRow label={tForm('seats')} value={String(simulation.seats)} />
            <FieldRow label={tForm('firstRegistrationDate')} value={firstRegisteredAt ? format(firstRegisteredAt, 'dd-MM-yyyy') : null} />
            <FieldRow label={tForm('isVan')} value={simulation.isVan ? tDetail('yes') : tDetail('no')} />
            <FieldRow label={tDetail('isNewCar')} value={simulation.isNewCar ? tDetail('yes') : tDetail('no')} />
            {simulation.purchasePrice != null && (
              <FieldRow label={tDetail('purchasePrice')} value={`€ ${simulation.purchasePrice.toLocaleString()}`} />
            )}
            {simulation.rejectionReason != null && simulation.rejectionReason.trim() !== '' && (
              <FieldRow label={tDetail('rejectionReason')} value={simulation.rejectionReason} />
            )}
            {simulation.estimatedPrice != null && (
              <FieldRow label={tDetail('estimatedPrice')} value={`€ ${simulation.estimatedPrice.toLocaleString()}`} />
            )}
            {simulation.cylinderCc != null && <FieldRow label={tDetail('cylinderCc')} value={`${simulation.cylinderCc} cc`} />}
            {simulation.co2Emission != null && <FieldRow label={tDetail('co2Emission')} value={`${simulation.co2Emission} g/km`} />}
            {simulation.ecoscore != null && <FieldRow label={tDetail('ecoscore')} value={String(simulation.ecoscore)} />}
            {simulation.euroNormCode != null && <FieldRow label={tDetail('euroNormCode')} value={simulation.euroNormCode} />}
            {simulation.consumption != null && <FieldRow label={tDetail('consumption')} value={`${simulation.consumption} L/100km`} />}
            {createdAt && <FieldRow label={tCol('created')} value={format(createdAt, 'dd-MM-yyyy HH:mm')} />}
            {updatedAt && <FieldRow label={tCol('updated')} value={format(updatedAt, 'dd-MM-yyyy HH:mm')} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tDetail('stepsTitle')}</CardTitle>
            <CardDescription>{tDetail('stepsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {simulation.steps && simulation.steps.length > 0 ? (
              <ul className="space-y-2">
                {simulation.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <StepIcon status={step.status} />
                    <span>{step.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">{tDetail('noSteps')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
