'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { Check, CheckCircle2, ChevronDown, CircleDashed, Lock } from 'lucide-react';
import * as z from 'zod';

import {
  CarOnboarding,
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInfoSessionStatus,
  CarOnboardingInsurerStatus,
  CarOnboardingRoadAssistancePlanStatus,
  isCarInfoSectionComplete,
  isInfoSessionSectionComplete,
  isInsurerSectionComplete,
  isPlayConnectorSectionComplete,
  isRoadAssistancePlanSectionComplete,
  isUserInfoSectionComplete,
} from '@/domain/car-onboarding.model';
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/app/components/ui/field';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { AdminDateFieldControl } from '@/app/components/form/admin-date-field-control';
import { AdminNumberFieldControl } from '@/app/components/form/admin-number-field-control';
import { AdminSearchableSelectField } from '@/app/components/form/admin-searchable-select-field';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { AdminTextareaFieldControl } from '@/app/components/form/admin-textarea-field-control';
import { AdminRegistrationCertificateField } from './admin-registration-certificate-field';
import { CarOnboardingSubprocessFlow, type SubprocessFlowStep } from './car-onboarding-subprocess-flow';

export const CAR_ONBOARDING_FORM_ID = 'car-onboarding-editor-form';

export const CAR_ONBOARDING_TAB_IDS = [
  'owner',
  'infoSession',
  'userInfo',
  'carInfo',
  'insurer',
  'roadAssistancePlan',
  'carValue',
  'finalize',
] as const;
export type CarOnboardingTabId = (typeof CAR_ONBOARDING_TAB_IDS)[number];

export const parseCarOnboardingTab = (tab: string | null): CarOnboardingTabId => {
  if (tab === 'playConnector') return 'owner';
  return CAR_ONBOARDING_TAB_IDS.includes(tab as CarOnboardingTabId) ? (tab as CarOnboardingTabId) : 'owner';
};

const NONE = 'none';
const CAR_TYPE_OTHER = '__other__';

interface CarOnboardingFormProps {
  initialCarOnboarding: CarOnboarding;
  formId?: string;
  isSubmitting?: boolean;
  activeTab: CarOnboardingTabId;
  onTabChange: (tab: CarOnboardingTabId) => void;
  onSubmit: (row: CarOnboarding) => Promise<void>;
  onOverruleCarValueAgreement?: () => Promise<void>;
  onConfirmInfoSession?: () => Promise<void>;
  onStartCarOnboarding?: () => Promise<void>;
  onUploadRegistrationCertificate?: (side: 'front' | 'back', file: File) => Promise<void>;
  onDownloadRegistrationCertificate?: (side: 'front' | 'back') => Promise<void>;
  onUploadInspectionCertificate?: (file: File) => Promise<void>;
  onDownloadInspectionCertificate?: () => Promise<void>;
  onUploadPinkForm?: (file: File) => Promise<void>;
  onDownloadPinkForm?: () => Promise<void>;
}

interface FormValues {
  street: string;
  townId: string;
  townName: string;
  phone: string;
  brandId: string;
  brandName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  carTypeId: string;
  carTypeName: string;
  carTypeOther: string;
  vin: string;
  plate: string;
  mileage: string;
  seats: string;
  firstRegisteredAt: string;
  isVan: boolean;
  isPurchased: boolean;
  isNewCar: boolean;
  purchasePrice: string;
  depreciationCostKm: string;
  carValue: string;
  carValueCounterProposal: string;
  carValueCounterProposalMessage: string;
  insurerId: string;
  insurerName: string;
  insurerContractStartedAt: string;
  hasInsuranceContract: boolean;
  hasExistingRoadAssistancePlan: boolean;
  existingRoadAssistancePlanEndDate: string;
  roadAssistancePlanId: string;
  roadAssistancePlanName: string;
  ownerId: string;
  ownerName: string;
}

const formatDateInput = (date: Date | string | null): string => {
  if (date == null) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const getInitialState = (row: CarOnboarding): FormValues => {
  const hasOtherCarType = Boolean(row.carTypeOther?.trim()) && row.carType == null;
  return {
    street: row.street ?? '',
    townId: row.town?.id ?? NONE,
    townName: row.town?.name ?? '',
    phone: row.phone ?? '',
    brandId: row.brand?.id ?? NONE,
    brandName: row.brand?.name ?? '',
    fuelTypeId: row.fuelType?.id ?? NONE,
    fuelTypeName: row.fuelType?.name ?? '',
    carTypeId: hasOtherCarType ? CAR_TYPE_OTHER : (row.carType?.id ?? NONE),
    carTypeName: row.carType?.name ?? '',
    carTypeOther: row.carTypeOther ?? '',
    vin: row.vin ?? '',
    plate: row.plate ?? '',
    mileage: String(row.mileage),
    seats: String(row.seats),
    firstRegisteredAt: formatDateInput(row.firstRegisteredAt),
    isVan: row.isVan,
    isPurchased: row.isPurchased,
    isNewCar: row.isNewCar,
    purchasePrice: String(row.purchasePrice),
    depreciationCostKm: String(row.depreciationCostKm),
    carValue: String(row.carValue),
    carValueCounterProposal: String(row.carValueCounterProposal),
    carValueCounterProposalMessage: row.carValueCounterProposalMessage ?? '',
    insurerId: row.insurer?.id ?? NONE,
    insurerName: row.insurer?.name ?? '',
    insurerContractStartedAt: formatDateInput(row.insurerContractStartedAt),
    hasInsuranceContract: row.hasInsuranceContract,
    hasExistingRoadAssistancePlan: row.hasExistingRoadAssistancePlan,
    existingRoadAssistancePlanEndDate: formatDateInput(row.existingRoadAssistancePlanEndDate),
    roadAssistancePlanId: row.roadAssistancePlan?.id ?? NONE,
    roadAssistancePlanName: row.roadAssistancePlan?.name ?? '',
    ownerId: row.owner?.id ?? NONE,
    ownerName: row.owner?.name ?? '',
  };
};

const createSchema = (tCommon: (key: string) => string) =>
  z.object({
    street: z.string(),
    townId: z.string(),
    townName: z.string(),
    phone: z.string(),
    brandId: z.string(),
    brandName: z.string(),
    fuelTypeId: z.string(),
    fuelTypeName: z.string(),
    carTypeId: z.string(),
    carTypeName: z.string(),
    carTypeOther: z.string(),
    vin: z.string(),
    plate: z.string(),
    mileage: z.string().refine((v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0), tCommon('validation.nonNegativeInteger')),
    seats: z.string().refine((v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0), tCommon('validation.nonNegativeInteger')),
    firstRegisteredAt: z.string(),
    isVan: z.boolean(),
    isPurchased: z.boolean(),
    isNewCar: z.boolean(),
    purchasePrice: z.string().refine((v) => v === '' || Number(v) >= 0, tCommon('validation.nonNegativeNumber')),
    depreciationCostKm: z.string().refine((v) => v === '' || Number(v) >= 0, tCommon('validation.nonNegativeNumber')),
    carValue: z.string().refine((v) => v === '' || Number(v) >= 0, tCommon('validation.nonNegativeNumber')),
    carValueCounterProposal: z.string(),
    carValueCounterProposalMessage: z.string(),
    insurerId: z.string(),
    insurerName: z.string(),
    insurerContractStartedAt: z.string(),
    hasInsuranceContract: z.boolean(),
    hasExistingRoadAssistancePlan: z.boolean(),
    existingRoadAssistancePlanEndDate: z.string(),
    roadAssistancePlanId: z.string(),
    roadAssistancePlanName: z.string(),
    ownerId: z.string(),
    ownerName: z.string(),
  });

const toIdName = (id: string, name: string) => (id && id !== NONE ? { id, name: name.trim() || id } : null);

function PreparationStatusIcon({ status }: { status: CarOnboardingInPreparationStatus }) {
  switch (status) {
    case CarOnboardingInPreparationStatus.READY:
      return <CheckCircle2 className="size-3.5 shrink-0 text-green-600" aria-hidden />;
    case CarOnboardingInPreparationStatus.LOCKED:
      return <Lock className="text-muted-foreground size-3.5 shrink-0" aria-hidden />;
    default:
      return <CircleDashed className="text-muted-foreground size-3.5 shrink-0" aria-hidden />;
  }
}

type CarOnboardingStepTabCompletion = {
  playConnector: boolean;
  infoSession: boolean;
  userInfo: boolean;
  carInfo: boolean;
  insurer: boolean;
  roadAssistancePlan: boolean;
  carValue: boolean;
  preparationLocked: boolean;
};

function CarOnboardingPreparationTitle({
  preparationStatus,
  t,
}: {
  preparationStatus: CarOnboardingInPreparationStatus;
  t: ReturnType<typeof useTranslations<'admin.carOnboardings'>>;
}) {
  return (
    <p className="text-foreground flex items-center gap-1.5 px-1 text-sm font-semibold">
      <span>{t('tabs.preparationTitle')}</span>
      <span className="inline-flex shrink-0" title={t(`preparationStatus.${preparationStatus}`)}>
        <PreparationStatusIcon status={preparationStatus} />
      </span>
    </p>
  );
}

function CarOnboardingStepTabsList({
  completion,
  t,
}: {
  completion: CarOnboardingStepTabCompletion;
  t: ReturnType<typeof useTranslations<'admin.carOnboardings'>>;
}) {
  return (
    <TabsList variant="line" className="h-fit w-full">
      <TabsTrigger value="owner" className="gap-1.5">
        {t('tabs.owner')}
        {completion.playConnector ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
      <TabsTrigger value="infoSession" className="gap-1.5">
        {t('tabs.infoSession')}
        {completion.infoSession ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
      <TabsTrigger value="userInfo" className="gap-1.5">
        {t('tabs.userInfo')}
        {completion.userInfo ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
      <TabsTrigger value="carInfo" className="gap-1.5">
        {t('tabs.carInfo')}
        {completion.carInfo ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
      <TabsTrigger value="insurer" className="gap-1.5">
        {t('tabs.insurer')}
        {completion.insurer ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
      <TabsTrigger value="roadAssistancePlan" className="gap-1.5">
        {t('tabs.roadAssistancePlan')}
        {completion.roadAssistancePlan ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
      <TabsTrigger value="carValue" className="gap-1.5">
        {t('tabs.carValue')}
        {completion.carValue ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
      <TabsTrigger value="finalize" className="gap-1.5">
        {t('tabs.finalize')}
        {completion.preparationLocked ? <Check className="text-primary size-3.5 shrink-0" aria-hidden /> : null}
      </TabsTrigger>
    </TabsList>
  );
}

export function CarOnboardingForm({
  initialCarOnboarding,
  formId = CAR_ONBOARDING_FORM_ID,
  isSubmitting = false,
  activeTab,
  onTabChange,
  onSubmit,
  onOverruleCarValueAgreement,
  onConfirmInfoSession,
  onStartCarOnboarding,
  onUploadRegistrationCertificate,
  onDownloadRegistrationCertificate,
  onUploadInspectionCertificate,
  onDownloadInspectionCertificate,
  onUploadPinkForm,
  onDownloadPinkForm,
}: CarOnboardingFormProps) {
  const t = useTranslations('admin.carOnboardings');
  const tCommon = useTranslations('admin.common');
  const tShared = useTranslations('common');
  const [isOverruleDialogOpen, setIsOverruleDialogOpen] = useState(false);
  const [isOverruling, setIsOverruling] = useState(false);
  const [isConfirmInfoSessionDialogOpen, setIsConfirmInfoSessionDialogOpen] = useState(false);
  const [isConfirmingInfoSession, setIsConfirmingInfoSession] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const schema = useMemo(() => createSchema(tCommon), [tCommon]);
  const initialState = useMemo(() => getInitialState(initialCarOnboarding), [initialCarOnboarding]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  const hasOtherCarType = Boolean(initialCarOnboarding.carTypeOther?.trim()) && initialCarOnboarding.carType == null;
  const brandId = form.watch('brandId');
  const fuelTypeId = form.watch('fuelTypeId');
  const carTypeQueryParams = useMemo(
    () => (brandId && brandId !== NONE && fuelTypeId && fuelTypeId !== NONE ? { brandId, fuelTypeId, isActive: 'true' } : undefined),
    [brandId, fuelTypeId],
  );

  const clearCarTypeSelection = () => {
    form.setValue('carTypeId', NONE, { shouldValidate: true });
    form.setValue('carTypeName', '', { shouldValidate: true });
  };

  const watchedValues = form.watch();
  const savedOwnerId = initialCarOnboarding.owner?.id ?? NONE;
  const playConnectorComplete = isPlayConnectorSectionComplete(initialCarOnboarding);
  const infoSessionComplete = isInfoSessionSectionComplete(initialCarOnboarding);
  const userInfoComplete = isUserInfoSectionComplete({
    street: watchedValues.street.trim() || null,
    town: watchedValues.townId !== NONE ? { id: watchedValues.townId } : null,
    phone: watchedValues.phone.trim() || null,
  });
  const carInfoComplete = isCarInfoSectionComplete({
    brand: watchedValues.brandId !== NONE ? { id: watchedValues.brandId } : null,
    fuelType: watchedValues.fuelTypeId !== NONE ? { id: watchedValues.fuelTypeId } : null,
    carType:
      hasOtherCarType || watchedValues.carTypeId === NONE || watchedValues.carTypeId === CAR_TYPE_OTHER
        ? null
        : { id: watchedValues.carTypeId },
    carTypeOther: hasOtherCarType || watchedValues.carTypeId === CAR_TYPE_OTHER ? watchedValues.carTypeOther.trim() || null : null,
    isPurchased: watchedValues.isPurchased,
    isNewCar: watchedValues.isNewCar,
    firstRegisteredAt: watchedValues.firstRegisteredAt ? new Date(watchedValues.firstRegisteredAt) : null,
    registrationCertificateFront: initialCarOnboarding.registrationCertificateFront,
    registrationCertificateBack: initialCarOnboarding.registrationCertificateBack,
    inspectionCertificate: initialCarOnboarding.inspectionCertificate,
    pinkForm: initialCarOnboarding.pinkForm,
  });
  const insurerComplete = isInsurerSectionComplete({
    insurerStatus: !watchedValues.hasInsuranceContract
      ? CarOnboardingInsurerStatus.NOT_APPLICABLE
      : watchedValues.insurerId !== NONE && watchedValues.insurerContractStartedAt.trim() !== ''
        ? CarOnboardingInsurerStatus.READY
        : CarOnboardingInsurerStatus.TODO,
  });
  const roadAssistancePlanComplete = isRoadAssistancePlanSectionComplete({
    roadAssistancePlanStatus:
      watchedValues.roadAssistancePlanId === NONE
        ? CarOnboardingRoadAssistancePlanStatus.TODO
        : watchedValues.hasExistingRoadAssistancePlan && watchedValues.existingRoadAssistancePlanEndDate.trim() === ''
          ? CarOnboardingRoadAssistancePlanStatus.TODO
          : CarOnboardingRoadAssistancePlanStatus.READY,
  });
  const carValueComplete = initialCarOnboarding.carValueStatus === CarOnboardingCarValueStatus.RESOLVED;
  const preparationReady = initialCarOnboarding.statusInPreparation === CarOnboardingInPreparationStatus.READY;
  const preparationLocked = initialCarOnboarding.statusInPreparation === CarOnboardingInPreparationStatus.LOCKED;
  const stepTabCompletion = useMemo(
    (): CarOnboardingStepTabCompletion => ({
      playConnector: playConnectorComplete,
      infoSession: infoSessionComplete,
      userInfo: userInfoComplete,
      carInfo: carInfoComplete,
      insurer: insurerComplete,
      roadAssistancePlan: roadAssistancePlanComplete,
      carValue: carValueComplete,
      preparationLocked,
    }),
    [
      playConnectorComplete,
      infoSessionComplete,
      userInfoComplete,
      carInfoComplete,
      insurerComplete,
      roadAssistancePlanComplete,
      carValueComplete,
      preparationLocked,
    ],
  );

  const userInfoFlowSteps = useMemo(
    (): SubprocessFlowStep[] => [
      { id: 'todo', label: t('subprocess.userInfo.todo') },
      { id: 'ready', label: t('subprocess.userInfo.ready') },
    ],
    [t],
  );

  const playConnectorFlowSteps = useMemo(
    (): SubprocessFlowStep[] => [
      { id: 'todo', label: t('subprocess.playConnector.todo') },
      { id: 'ready', label: t('subprocess.playConnector.ready') },
    ],
    [t],
  );

  const infoSessionFlowSteps = useMemo(
    (): SubprocessFlowStep[] => [
      { id: CarOnboardingInfoSessionStatus.TODO, label: t('subprocess.infoSession.todo') },
      { id: CarOnboardingInfoSessionStatus.ENROLLED, label: t('subprocess.infoSession.enrolled') },
      { id: CarOnboardingInfoSessionStatus.DONE, label: t('subprocess.infoSession.done') },
    ],
    [t],
  );

  const carInfoFlowSteps = useMemo(
    (): SubprocessFlowStep[] => [
      { id: 'todo', label: t('subprocess.carInfo.todo') },
      { id: 'ready', label: t('subprocess.carInfo.ready') },
    ],
    [t],
  );

  const insurerFlowSteps = useMemo((): SubprocessFlowStep[] => {
    if (!watchedValues.hasInsuranceContract) {
      return [{ id: CarOnboardingInsurerStatus.NOT_APPLICABLE, label: t('subprocess.insurer.notApplicable') }];
    }
    return [
      { id: CarOnboardingInsurerStatus.TODO, label: t('subprocess.insurer.todo') },
      { id: CarOnboardingInsurerStatus.READY, label: t('subprocess.insurer.ready') },
    ];
  }, [t, watchedValues.hasInsuranceContract]);

  const insurerFlowCurrent = !watchedValues.hasInsuranceContract
    ? CarOnboardingInsurerStatus.NOT_APPLICABLE
    : insurerComplete
      ? CarOnboardingInsurerStatus.READY
      : CarOnboardingInsurerStatus.TODO;

  const roadAssistancePlanFlowSteps = useMemo(
    (): SubprocessFlowStep[] => [
      { id: CarOnboardingRoadAssistancePlanStatus.TODO, label: t('subprocess.roadAssistancePlan.todo') },
      { id: CarOnboardingRoadAssistancePlanStatus.READY, label: t('subprocess.roadAssistancePlan.ready') },
    ],
    [t],
  );

  const roadAssistancePlanFlowCurrent = roadAssistancePlanComplete
    ? CarOnboardingRoadAssistancePlanStatus.READY
    : CarOnboardingRoadAssistancePlanStatus.TODO;

  const carValueFlowSteps = useMemo(
    (): SubprocessFlowStep[] => [
      { id: CarOnboardingCarValueStatus.TODO, label: t('subprocess.carValue.todo') },
      { id: CarOnboardingCarValueStatus.PROPOSAL, label: t('subprocess.carValue.proposal') },
      { id: CarOnboardingCarValueStatus.COUNTER, label: t('subprocess.carValue.counter') },
      { id: CarOnboardingCarValueStatus.RESOLVED, label: t('subprocess.carValue.resolved') },
    ],
    [t],
  );

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
  }, [form, initialState, initialStateKey]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CarOnboarding = {
      ...initialCarOnboarding,
      street: values.street.trim() || null,
      town: toIdName(values.townId, values.townName),
      phone: values.phone.trim() || null,
      brand: toIdName(values.brandId, values.brandName),
      fuelType: toIdName(values.fuelTypeId, values.fuelTypeName),
      carType:
        hasOtherCarType || values.carTypeId === NONE || values.carTypeId === CAR_TYPE_OTHER
          ? null
          : toIdName(values.carTypeId, values.carTypeName),
      carTypeOther: hasOtherCarType ? initialCarOnboarding.carTypeOther : null,
      vin: values.vin.trim() || null,
      plate: values.plate.trim() || null,
      mileage: values.mileage === '' ? 0 : Number(values.mileage),
      seats: values.seats === '' ? 0 : Number(values.seats),
      firstRegisteredAt: values.firstRegisteredAt ? new Date(values.firstRegisteredAt) : null,
      isVan: values.isVan,
      isPurchased: values.isPurchased,
      isNewCar: values.isNewCar,
      purchasePrice: values.purchasePrice === '' ? 0 : Number(values.purchasePrice),
      depreciationCostKm: values.depreciationCostKm === '' ? 0 : Number(values.depreciationCostKm),
      carValue: values.carValue === '' ? 0 : Number(values.carValue),
      carValueCounterProposal: initialCarOnboarding.carValueCounterProposal,
      carValueCounterProposalMessage: initialCarOnboarding.carValueCounterProposalMessage,
      insurer: !values.hasInsuranceContract ? null : toIdName(values.insurerId, values.insurerName),
      insurerContractStartedAt:
        !values.hasInsuranceContract || values.insurerContractStartedAt === '' ? null : new Date(values.insurerContractStartedAt),
      hasInsuranceContract: values.hasInsuranceContract,
      hasExistingRoadAssistancePlan: values.hasExistingRoadAssistancePlan,
      existingRoadAssistancePlanEndDate:
        !values.hasExistingRoadAssistancePlan || values.existingRoadAssistancePlanEndDate === ''
          ? null
          : new Date(values.existingRoadAssistancePlanEndDate),
      roadAssistancePlan: toIdName(values.roadAssistancePlanId, values.roadAssistancePlanName),
      owner: toIdName(values.ownerId, values.ownerName),
    };
    await onSubmit(payload);
  });

  const handleOverruleConfirm = async () => {
    if (!onOverruleCarValueAgreement) return;
    setIsOverruling(true);
    try {
      await onOverruleCarValueAgreement();
      setIsOverruleDialogOpen(false);
    } finally {
      setIsOverruling(false);
    }
  };

  const handleConfirmInfoSessionConfirm = async () => {
    if (!onConfirmInfoSession) return;
    setIsConfirmingInfoSession(true);
    try {
      await onConfirmInfoSession();
      setIsConfirmInfoSessionDialogOpen(false);
    } finally {
      setIsConfirmingInfoSession(false);
    }
  };

  const handleStartConfirm = async () => {
    if (!onStartCarOnboarding) return;
    setIsStarting(true);
    try {
      await onStartCarOnboarding();
      setIsStartDialogOpen(false);
    } finally {
      setIsStarting(false);
    }
  };

  const showOverruleButton =
    onOverruleCarValueAgreement != null && initialCarOnboarding.carValueStatus !== CarOnboardingCarValueStatus.RESOLVED;

  const showConfirmInfoSessionButton =
    onConfirmInfoSession != null && initialCarOnboarding.infoSessionStatus === CarOnboardingInfoSessionStatus.ENROLLED;

  const formatInfoSessionDate = (value: Date | string | null): string => {
    if (value == null) return '—';
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          onTabChange(parseCarOnboardingTab(value));
          setMobileNavOpen(false);
        }}
        orientation="vertical"
        className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8"
      >
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-48">
          <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen} className="group/mobile-nav sm:hidden">
            <CollapsibleTrigger
              className="border-border bg-muted/40 hover:bg-muted/60 flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium"
              aria-label={t('tabs.mobileNavToggle', { step: t(`tabs.${activeTab}`) })}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="text-muted-foreground shrink-0">{t('tabs.preparationTitle')}</span>
                <span className="text-muted-foreground shrink-0" aria-hidden>
                  ·
                </span>
                <span className="truncate">{t(`tabs.${activeTab}`)}</span>
                <span className="inline-flex shrink-0" title={t(`preparationStatus.${initialCarOnboarding.statusInPreparation}`)}>
                  <PreparationStatusIcon status={initialCarOnboarding.statusInPreparation} />
                </span>
              </span>
              <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]/mobile-nav:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-2 pt-2">
              <CarOnboardingStepTabsList completion={stepTabCompletion} t={t} />
            </CollapsibleContent>
          </Collapsible>

          <div className="hidden flex-col gap-2 sm:flex">
            <CarOnboardingPreparationTitle preparationStatus={initialCarOnboarding.statusInPreparation} t={t} />
            <CarOnboardingStepTabsList completion={stepTabCompletion} t={t} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <TabsContent value="owner" className="mt-0">
            <FieldSet className="max-w-2xl">
              <div className="flex flex-col gap-1">
                <FieldLegend className="mb-0">{t('tabs.owner')}</FieldLegend>
                <CarOnboardingSubprocessFlow steps={playConnectorFlowSteps} currentStepId={playConnectorComplete ? 'ready' : 'todo'} />
              </div>
              <FieldGroup className="gap-6">
                <Controller
                  name="ownerId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminSearchableSelectField
                      label={t('columns.owner')}
                      value={field.value}
                      selectedLabel={field.value === NONE ? undefined : form.watch('ownerName') || undefined}
                      onValueChange={(id, option) => {
                        field.onChange(id);
                        form.setValue('ownerName', id === NONE ? '' : option.name, { shouldValidate: true });
                      }}
                      apiPath="users"
                      appendOptions={[{ id: NONE, name: t('form.none') }]}
                      placeholder={t('form.placeholders.owner')}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {watchedValues.ownerId === savedOwnerId ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('columns.ownerHasPlayConnector')}</p>
                    <p className="text-muted-foreground text-sm">
                      {initialCarOnboarding.owner?.hasPlayConnector ? tShared('yes') : tShared('no')}
                    </p>
                  </div>
                ) : (
                  <FieldDescription>{t('form.ownerPlayConnectorPendingSave')}</FieldDescription>
                )}
                <FieldDescription>{t('form.playConnectorHint')}</FieldDescription>
              </FieldGroup>
            </FieldSet>
          </TabsContent>
          <TabsContent value="infoSession" className="mt-0">
            <FieldSet className="max-w-2xl">
              <div className="flex flex-col gap-1">
                <FieldLegend className="mb-0">{t('tabs.infoSession')}</FieldLegend>
                <CarOnboardingSubprocessFlow steps={infoSessionFlowSteps} currentStepId={initialCarOnboarding.infoSessionStatus} />
              </div>
              <FieldGroup className="gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('columns.infoSessionDate')}</p>
                  <p className="text-muted-foreground text-sm">{formatInfoSessionDate(initialCarOnboarding.infoSessionDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t('columns.infoSessionPcId')}</p>
                  <p className="text-muted-foreground text-sm">{initialCarOnboarding.infoSessionPcId?.trim() || '—'}</p>
                </div>
                <FieldDescription>{t('form.infoSessionHint')}</FieldDescription>
                {showConfirmInfoSessionButton ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfirmInfoSessionDialogOpen(true)}
                    disabled={isSubmitting || isConfirmingInfoSession}
                  >
                    {t('form.confirmInfoSession')}
                  </Button>
                ) : null}
              </FieldGroup>
            </FieldSet>
          </TabsContent>
          <TabsContent value="userInfo" className="mt-0">
            <FieldSet className="max-w-2xl">
              <div className="flex flex-col gap-1">
                <FieldLegend className="mb-0">{t('tabs.userInfo')}</FieldLegend>
                <CarOnboardingSubprocessFlow steps={userInfoFlowSteps} currentStepId={userInfoComplete ? 'ready' : 'todo'} />
              </div>
              <FieldGroup className="gap-6">
                <Controller
                  name="street"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminTextFieldControl
                      label={t('columns.street')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Controller
                  name="townId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminSearchableSelectField
                      label={t('columns.town')}
                      value={field.value}
                      selectedLabel={field.value === NONE ? undefined : form.watch('townName') || undefined}
                      onValueChange={(id, option) => {
                        field.onChange(id);
                        form.setValue('townName', id === NONE ? '' : option.name, { shouldValidate: true });
                      }}
                      apiPath="towns"
                      labelKey="displayLabel"
                      appendOptions={[{ id: NONE, name: t('form.none') }]}
                      placeholder={t('form.placeholders.town')}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminTextFieldControl
                      label={t('columns.phone')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </TabsContent>

          <TabsContent value="carInfo" className="mt-0">
            <FieldSet className="max-w-2xl">
              <div className="flex flex-col gap-1">
                <FieldLegend className="mb-0">{t('tabs.carInfo')}</FieldLegend>
                <CarOnboardingSubprocessFlow steps={carInfoFlowSteps} currentStepId={carInfoComplete ? 'ready' : 'todo'} />
              </div>
              <FieldGroup className="gap-6">
                <Controller
                  name="isPurchased"
                  control={form.control}
                  render={({ field }) => (
                    <AdminSwitchFieldControl
                      id="car-onboarding-is-purchased-car"
                      label={t('columns.isPurchased')}
                      checked={field.value}
                      onChange={field.onChange}
                      disabled
                      description={t('form.help.isPurchasedReadOnly')}
                    />
                  )}
                />
                <Controller
                  name="isNewCar"
                  control={form.control}
                  render={({ field }) => (
                    <AdminSwitchFieldControl
                      id="car-onboarding-is-new-car"
                      label={t('columns.isNewCar')}
                      checked={field.value}
                      onChange={field.onChange}
                      disabled
                      description={t('form.help.isNewCarReadOnly')}
                    />
                  )}
                />
                <Controller
                  name="brandId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminSearchableSelectField
                      label={t('columns.brand')}
                      value={field.value}
                      selectedLabel={field.value === NONE ? undefined : form.watch('brandName') || undefined}
                      onValueChange={(id, option) => {
                        field.onChange(id);
                        form.setValue('brandName', id === NONE ? '' : option.name, { shouldValidate: true });
                        if (!hasOtherCarType) clearCarTypeSelection();
                      }}
                      apiPath="car-brands"
                      appendOptions={[{ id: NONE, name: t('form.none') }]}
                      placeholder={t('form.placeholders.brand')}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Controller
                  name="fuelTypeId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminSearchableSelectField
                      label={t('columns.fuelType')}
                      value={field.value}
                      selectedLabel={field.value === NONE ? undefined : form.watch('fuelTypeName') || undefined}
                      onValueChange={(id, option) => {
                        field.onChange(id);
                        form.setValue('fuelTypeName', id === NONE ? '' : option.name, { shouldValidate: true });
                        if (!hasOtherCarType) clearCarTypeSelection();
                      }}
                      apiPath="fuel-types"
                      appendOptions={[{ id: NONE, name: t('form.none') }]}
                      placeholder={t('form.placeholders.fuelType')}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Controller
                  name="carTypeId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminSearchableSelectField
                      label={t('columns.carType')}
                      value={field.value}
                      selectedLabel={
                        hasOtherCarType
                          ? t('form.carTypeOtherOption')
                          : field.value === NONE
                            ? undefined
                            : form.watch('carTypeName') || undefined
                      }
                      onValueChange={(id, option) => {
                        field.onChange(id);
                        form.setValue('carTypeName', id === NONE ? '' : option.name, { shouldValidate: true });
                      }}
                      apiPath="car-types"
                      queryParams={carTypeQueryParams}
                      appendOptions={[{ id: NONE, name: t('form.none') }]}
                      placeholder={
                        brandId && brandId !== NONE && fuelTypeId && fuelTypeId !== NONE
                          ? t('form.placeholders.carType')
                          : t('form.placeholders.carTypeFirst')
                      }
                      error={fieldState.error?.message}
                      disabled={isSubmitting || hasOtherCarType || brandId === NONE || fuelTypeId === NONE || !brandId || !fuelTypeId}
                    />
                  )}
                />
                {hasOtherCarType ? (
                  <Controller
                    name="carTypeOther"
                    control={form.control}
                    render={({ field }) => (
                      <AdminTextFieldControl
                        label={t('columns.carTypeOther')}
                        value={field.value}
                        onChange={() => {}}
                        disabled
                        description={t('form.help.carTypeOtherReadOnly')}
                      />
                    )}
                  />
                ) : null}
                <Controller
                  name="mileage"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminNumberFieldControl
                      label={t('columns.mileage')}
                      value={field.value}
                      onChange={watchedValues.isNewCar ? () => {} : field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting || watchedValues.isNewCar}
                      min={0}
                      step={1}
                      description={watchedValues.isNewCar ? t('form.help.firstRegisteredAtNewCarReadOnly') : undefined}
                    />
                  )}
                />
                <Controller
                  name="seats"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminNumberFieldControl
                      label={t('columns.seats')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                      min={0}
                      step={1}
                    />
                  )}
                />
                <Controller
                  name="firstRegisteredAt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminDateFieldControl
                      label={t('columns.firstRegisteredAt')}
                      value={field.value}
                      onChange={watchedValues.isNewCar ? () => {} : field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting || watchedValues.isNewCar}
                      description={watchedValues.isNewCar ? t('form.help.firstRegisteredAtNewCarReadOnly') : undefined}
                    />
                  )}
                />
                <Controller
                  name="purchasePrice"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminNumberFieldControl
                      label={t('columns.purchasePrice')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                      min={0}
                      step={0.01}
                    />
                  )}
                />
                <Controller
                  name="isVan"
                  control={form.control}
                  render={({ field }) => (
                    <AdminSwitchFieldControl
                      id="car-onboarding-is-van"
                      label={t('columns.isVan')}
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {onUploadRegistrationCertificate ? (
                  <AdminRegistrationCertificateField
                    label={t('columns.registrationCertificateFront')}
                    fileName={initialCarOnboarding.registrationCertificateFront?.name}
                    disabled={isSubmitting || preparationLocked}
                    onUpload={(file) => onUploadRegistrationCertificate('front', file)}
                    onDownload={
                      onDownloadRegistrationCertificate && initialCarOnboarding.registrationCertificateFront
                        ? () => onDownloadRegistrationCertificate('front')
                        : undefined
                    }
                  />
                ) : null}
                {onUploadRegistrationCertificate ? (
                  <AdminRegistrationCertificateField
                    label={t('columns.registrationCertificateBack')}
                    fileName={initialCarOnboarding.registrationCertificateBack?.name}
                    disabled={isSubmitting || preparationLocked}
                    onUpload={(file) => onUploadRegistrationCertificate('back', file)}
                    onDownload={
                      onDownloadRegistrationCertificate && initialCarOnboarding.registrationCertificateBack
                        ? () => onDownloadRegistrationCertificate('back')
                        : undefined
                    }
                  />
                ) : null}
                <Controller
                  name="vin"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminTextFieldControl
                      label={t('columns.vin')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <Controller
                  name="plate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminTextFieldControl
                      label={t('columns.plate')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {onUploadInspectionCertificate ? (
                  <AdminRegistrationCertificateField
                    label={t('columns.inspectionCertificate')}
                    fileName={initialCarOnboarding.inspectionCertificate?.name}
                    disabled={isSubmitting || preparationLocked}
                    namespace="inspectionCertificate"
                    onUpload={onUploadInspectionCertificate}
                    onDownload={
                      onDownloadInspectionCertificate && initialCarOnboarding.inspectionCertificate
                        ? onDownloadInspectionCertificate
                        : undefined
                    }
                  />
                ) : null}
                {onUploadPinkForm ? (
                  <AdminRegistrationCertificateField
                    label={t('columns.pinkForm')}
                    fileName={initialCarOnboarding.pinkForm?.name}
                    disabled={isSubmitting || preparationLocked}
                    namespace="pinkForm"
                    onUpload={onUploadPinkForm}
                    onDownload={onDownloadPinkForm && initialCarOnboarding.pinkForm ? onDownloadPinkForm : undefined}
                  />
                ) : null}
              </FieldGroup>
            </FieldSet>
          </TabsContent>

          <TabsContent value="insurer" className="mt-0">
            <FieldSet className="max-w-2xl">
              <div className="flex flex-col gap-1">
                <FieldLegend className="mb-0">{t('tabs.insurer')}</FieldLegend>
                <CarOnboardingSubprocessFlow steps={insurerFlowSteps} currentStepId={insurerFlowCurrent} />
              </div>
              <FieldGroup className="gap-6">
                <Controller
                  name="hasInsuranceContract"
                  control={form.control}
                  render={({ field }) => (
                    <AdminSwitchFieldControl
                      id="car-onboarding-has-insurance-contract"
                      label={t('columns.hasInsuranceContract')}
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {watchedValues.hasInsuranceContract ? (
                  <>
                    <Controller
                      name="insurerId"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <AdminSearchableSelectField
                          label={t('columns.insurer')}
                          value={field.value}
                          selectedLabel={field.value === NONE ? undefined : form.watch('insurerName') || undefined}
                          onValueChange={(id, option) => {
                            field.onChange(id);
                            form.setValue('insurerName', id === NONE ? '' : option.name, { shouldValidate: true });
                          }}
                          apiPath="insurers"
                          appendOptions={[{ id: NONE, name: t('form.none') }]}
                          placeholder={t('form.placeholders.insurer')}
                          error={fieldState.error?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                    <Controller
                      name="insurerContractStartedAt"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <AdminDateFieldControl
                          label={t('columns.insurerContractStartedAt')}
                          value={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  </>
                ) : null}
              </FieldGroup>
            </FieldSet>
          </TabsContent>

          <TabsContent value="roadAssistancePlan" className="mt-0">
            <FieldSet className="max-w-2xl">
              <div className="flex flex-col gap-1">
                <FieldLegend className="mb-0">{t('tabs.roadAssistancePlan')}</FieldLegend>
                <CarOnboardingSubprocessFlow steps={roadAssistancePlanFlowSteps} currentStepId={roadAssistancePlanFlowCurrent} />
              </div>
              <FieldGroup className="gap-6">
                <Controller
                  name="hasExistingRoadAssistancePlan"
                  control={form.control}
                  render={({ field }) => (
                    <AdminSwitchFieldControl
                      id="car-onboarding-has-existing-road-assistance-plan"
                      label={
                        watchedValues.isPurchased && watchedValues.isNewCar
                          ? t('form.includedRoadAssistancePlan')
                          : t('columns.hasExistingRoadAssistancePlan')
                      }
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {watchedValues.hasExistingRoadAssistancePlan ? (
                  <Controller
                    name="existingRoadAssistancePlanEndDate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <AdminDateFieldControl
                        label={t('columns.existingRoadAssistancePlanEndDate')}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                ) : null}
                <Controller
                  name="roadAssistancePlanId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminSearchableSelectField
                      label={t('columns.roadAssistancePlan')}
                      value={field.value}
                      selectedLabel={field.value === NONE ? undefined : form.watch('roadAssistancePlanName') || undefined}
                      onValueChange={(id, option) => {
                        field.onChange(id);
                        form.setValue('roadAssistancePlanName', id === NONE ? '' : option.name, { shouldValidate: true });
                      }}
                      apiPath="road-assistance-plans"
                      queryParams={{ isActive: 'true' }}
                      descriptionKey="description"
                      appendOptions={[{ id: NONE, name: t('form.none') }]}
                      placeholder={t('form.placeholders.roadAssistancePlan')}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </TabsContent>

          <TabsContent value="carValue" className="mt-0">
            <FieldSet className="max-w-2xl">
              <div className="flex flex-col gap-1">
                <FieldLegend className="mb-0">{t('tabs.carValue')}</FieldLegend>
                <CarOnboardingSubprocessFlow steps={carValueFlowSteps} currentStepId={initialCarOnboarding.carValueStatus} />
              </div>
              <FieldGroup className="gap-6">
                <Controller
                  name="carValue"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminNumberFieldControl
                      label={t('columns.carValue')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                      min={0}
                      step={0.01}
                    />
                  )}
                />
                <Controller
                  name="depreciationCostKm"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <AdminNumberFieldControl
                      label={t('columns.depreciationCostKm')}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      disabled={isSubmitting}
                      min={0}
                      step={0.0001}
                    />
                  )}
                />
                <Controller
                  name="carValueCounterProposal"
                  control={form.control}
                  render={({ field }) => (
                    <AdminNumberFieldControl
                      label={t('columns.carValueCounterProposal')}
                      value={field.value}
                      onChange={() => {}}
                      disabled
                      description={t('form.help.counterReadOnly')}
                    />
                  )}
                />
                <Controller
                  name="carValueCounterProposalMessage"
                  control={form.control}
                  render={({ field }) => (
                    <AdminTextareaFieldControl
                      label={t('columns.carValueCounterProposalMessage')}
                      value={field.value}
                      onChange={() => {}}
                      disabled
                      description={t('form.help.counterReadOnly')}
                    />
                  )}
                />
                {showOverruleButton ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOverruleDialogOpen(true)}
                    disabled={isSubmitting || isOverruling}
                  >
                    {t('form.overruleAgreement')}
                  </Button>
                ) : null}
              </FieldGroup>
            </FieldSet>
          </TabsContent>

          <TabsContent value="finalize" className="mt-0">
            <FieldSet className="max-w-2xl">
              <FieldLegend>{t('form.startOnboardingSection')}</FieldLegend>
              {preparationLocked ? (
                <FieldDescription>{t('form.startOnboardingLocked')}</FieldDescription>
              ) : (
                <>
                  <FieldDescription>{preparationReady ? t('form.startOnboardingReady') : t('form.startOnboardingNotReady')}</FieldDescription>
                  {onStartCarOnboarding != null ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsStartDialogOpen(true)}
                      disabled={!preparationReady || isSubmitting || isStarting}
                    >
                      {t('form.startOnboarding')}
                    </Button>
                  ) : null}
                </>
              )}
            </FieldSet>
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={isOverruleDialogOpen} onOpenChange={isOverruling ? undefined : setIsOverruleDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('form.overruleAgreementTitle')}</DialogTitle>
            <DialogDescription>{t('form.overruleAgreementDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOverruleDialogOpen(false)} disabled={isOverruling}>
              {tCommon('actions.cancel')}
            </Button>
            <Button onClick={() => void handleOverruleConfirm()} disabled={isOverruling}>
              {isOverruling ? t('form.overruleAgreementConfirming') : t('form.overruleAgreementConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmInfoSessionDialogOpen} onOpenChange={isConfirmingInfoSession ? undefined : setIsConfirmInfoSessionDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('form.confirmInfoSessionTitle')}</DialogTitle>
            <DialogDescription>{t('form.confirmInfoSessionDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmInfoSessionDialogOpen(false)} disabled={isConfirmingInfoSession}>
              {tCommon('actions.cancel')}
            </Button>
            <Button onClick={() => void handleConfirmInfoSessionConfirm()} disabled={isConfirmingInfoSession}>
              {isConfirmingInfoSession ? t('form.confirmInfoSessionConfirming') : t('form.confirmInfoSessionConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStartDialogOpen} onOpenChange={isStarting ? undefined : setIsStartDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('form.startOnboardingTitle')}</DialogTitle>
            <DialogDescription>{t('form.startOnboardingDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)} disabled={isStarting}>
              {tCommon('actions.cancel')}
            </Button>
            <Button onClick={() => void handleStartConfirm()} disabled={isStarting}>
              {isStarting ? t('form.startOnboardingConfirming') : t('form.startOnboardingConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
