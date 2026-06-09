'use client';

import type { ReactNode } from 'react';

import type { SubflowId } from '../lib/types';
import { SubflowLayout } from './subflow-layout';
import { AdminAfhandelingSubflow } from './subflows/admin-afhandeling';
import { BuddySubflow } from './subflows/buddy';
import { CarDamageSubflow } from './subflows/car-damage';
import { CarInfoSubflow } from './subflows/car-info';
import { ContractSubflow } from './subflows/contract';
import { DegappAccountSubflow } from './subflows/degapp-account';
import { InfoSessionSubflow } from './subflows/info-session';
import { InstapwaardeSubflow } from './subflows/instapwaarde';
import { InsuranceInfoSubflow } from './subflows/insurance-info';
import { InsuranceProgressSubflow } from './subflows/insurance-progress';
import { ParkingCardSubflow } from './subflows/parking-card';
import { StartDatumSubflow } from './subflows/start-datum';
import { StickersSubflow } from './subflows/stickers';
import { SurveySubflow } from './subflows/survey';

const SUBFLOW_COMPONENTS: Record<SubflowId, () => ReactNode> = {
  'degapp-account': () => <DegappAccountSubflow />,
  'info-session': () => <InfoSessionSubflow />,
  'car-info': () => <CarInfoSubflow />,
  'insurance-info': () => <InsuranceInfoSubflow />,
  'start-datum': () => <StartDatumSubflow />,
  'car-damage': () => <CarDamageSubflow />,
  instapwaarde: () => <InstapwaardeSubflow />,
  contract: () => <ContractSubflow />,
  insurance: () => <InsuranceProgressSubflow />,
  'parking-card': () => <ParkingCardSubflow />,
  'admin-afhandeling': () => <AdminAfhandelingSubflow />,
  stickers: () => <StickersSubflow />,
  buddy: () => <BuddySubflow />,
  survey: () => <SurveySubflow />,
};

export function SubflowRenderer({ subflowId }: { subflowId: SubflowId }) {
  const Component = SUBFLOW_COMPONENTS[subflowId];
  if (!Component) {
    return <SubflowLayout subflowId={subflowId}>Subflow not implemented.</SubflowLayout>;
  }

  return <SubflowLayout subflowId={subflowId}>{Component()}</SubflowLayout>;
}
