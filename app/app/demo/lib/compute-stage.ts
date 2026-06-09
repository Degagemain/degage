import { getSubflowRequires, getSubflowsForStage, getSubflowsForVariant } from './subflows-config';
import type { OnboardingStage, OnboardingState, OnboardingVariant, SubflowId, SubflowState } from './types';

const STAGE_RANK: Record<OnboardingStage, number> = {
  preparation: 0,
  in_progress: 1,
  ready_to_share: 2,
};

function isDegappDone(data: OnboardingState['degapp-account']): boolean {
  return data.connected;
}

function isInfoSessionDone(data: OnboardingState['info-session']): boolean {
  return data.sessionFinished;
}

function isInfoSessionPending(data: OnboardingState['info-session']): boolean {
  return data.enrolledSessionId !== null && !data.sessionFinished;
}

function isCarInfoComplete(data: OnboardingState['car-info'], variant: OnboardingVariant): boolean {
  const baseComplete =
    data.vin.trim() !== '' &&
    data.mileage.trim() !== '' &&
    data.brand.trim() !== '' &&
    data.model.trim() !== '' &&
    data.year.trim() !== '' &&
    data.documentsUploaded;
  if (variant === 'new-car') {
    return baseComplete && data.pinkFormUploaded;
  }
  return baseComplete;
}

function isCarInfoPartial(data: OnboardingState['car-info'], variant: OnboardingVariant): boolean {
  return (
    data.vin.trim() !== '' ||
    data.mileage.trim() !== '' ||
    data.brand.trim() !== '' ||
    data.model.trim() !== '' ||
    data.year.trim() !== '' ||
    data.documentsUploaded ||
    (variant === 'new-car' && data.pinkFormUploaded)
  );
}

function isInsuranceInfoComplete(data: OnboardingState['insurance-info']): boolean {
  return data.startDate.trim() !== '' && data.insurer.trim() !== '';
}

function isInsuranceInfoPartial(data: OnboardingState['insurance-info']): boolean {
  return data.startDate.trim() !== '' || data.insurer.trim() !== '';
}

function isStartDatumComplete(data: OnboardingState['start-datum'], insuranceStart: string): boolean {
  if (!data.month.trim() || !data.year.trim()) return false;
  const selected = new Date(Number(data.year), Number(data.month) - 1, 1);
  if (Number.isNaN(selected.getTime())) return false;
  if (!insuranceStart) return true;
  const earliest = new Date(insuranceStart);
  if (Number.isNaN(earliest.getTime())) return true;
  earliest.setFullYear(earliest.getFullYear() + 1);
  earliest.setDate(1);
  return selected >= earliest;
}

function isCarDamageDone(data: OnboardingState['car-damage']): boolean {
  return data.photos.length > 0;
}

function isInstapwaardeDone(data: OnboardingState['instapwaarde']): boolean {
  return data.agreed === true;
}

function isInstapwaardePending(data: OnboardingState['instapwaarde']): boolean {
  return data.agreed === false || (data.agreed === null && (data.proposalValue.trim() !== '' || data.proposalMessage.trim() !== ''));
}

function isContractDone(data: OnboardingState['contract']): boolean {
  return data.signed;
}

function isContractPending(data: OnboardingState['contract']): boolean {
  return data.sent && !data.signed;
}

function isParkingCardDone(data: OnboardingState['parking-card']): boolean {
  return data.manuallyDone;
}

const ADMIN_HANDLING_TASKS = ['starter-bundle', 'degapp-fiche', 'website-map', 'car-email'] as const;

function isAdminHandlingDone(data: OnboardingState['admin-afhandeling']): boolean {
  return ADMIN_HANDLING_TASKS.every((task) => data[task]);
}

function isAdminHandlingPartial(data: OnboardingState['admin-afhandeling']): boolean {
  return ADMIN_HANDLING_TASKS.some((task) => data[task]) && !isAdminHandlingDone(data);
}

function isStickersDone(data: OnboardingState['stickers']): boolean {
  return data.locked && data.template !== null;
}

function isStickersPending(data: OnboardingState['stickers']): boolean {
  return data.template !== null && !data.locked;
}

function isSurveyDone(data: OnboardingState['survey']): boolean {
  return data.opened;
}

export function computeSubflowState(
  id: SubflowId,
  state: OnboardingState,
  variant: OnboardingVariant,
  currentStage: OnboardingStage,
): SubflowState {
  const definition = getSubflowsForVariant(variant).find((s) => s.id === id);
  if (!definition) return 'blocked';

  if (STAGE_RANK[definition.stage] > STAGE_RANK[currentStage]) {
    return 'blocked';
  }

  const requirementsMet = getSubflowRequires(definition, variant).every((reqId) => {
    const reqState = computeSubflowState(reqId, state, variant, currentStage);
    return reqState === 'done';
  });
  if (!requirementsMet) return 'blocked';

  switch (id) {
    case 'degapp-account':
      return isDegappDone(state['degapp-account']) ? 'done' : 'todo';
    case 'info-session':
      if (isInfoSessionDone(state['info-session'])) return 'done';
      if (isInfoSessionPending(state['info-session'])) return 'pending';
      return 'todo';
    case 'car-info':
      if (isCarInfoComplete(state['car-info'], variant)) return 'done';
      if (isCarInfoPartial(state['car-info'], variant)) return 'pending';
      return 'todo';
    case 'insurance-info':
      if (isInsuranceInfoComplete(state['insurance-info'])) return 'done';
      if (isInsuranceInfoPartial(state['insurance-info'])) return 'pending';
      return 'todo';
    case 'start-datum':
      return isStartDatumComplete(state['start-datum'], state['insurance-info'].startDate) ? 'done' : 'todo';
    case 'car-damage':
      return isCarDamageDone(state['car-damage']) ? 'done' : 'todo';
    case 'instapwaarde':
      if (isInstapwaardeDone(state.instapwaarde)) return 'done';
      if (isInstapwaardePending(state.instapwaarde)) return 'pending';
      return 'todo';
    case 'contract':
      if (isContractDone(state.contract)) return 'done';
      if (isContractPending(state.contract)) return 'pending';
      return 'todo';
    case 'insurance':
      if (isContractDone(state.contract)) return 'done';
      if (currentStage === 'in_progress') return 'pending';
      return 'todo';
    case 'parking-card':
      if (isParkingCardDone(state['parking-card'])) return 'done';
      if (currentStage === 'in_progress') return 'pending';
      return 'todo';
    case 'admin-afhandeling':
      if (isAdminHandlingDone(state['admin-afhandeling'])) return 'done';
      if (isAdminHandlingPartial(state['admin-afhandeling'])) return 'pending';
      if (currentStage === 'in_progress') return 'todo';
      return 'blocked';
    case 'stickers':
      if (isStickersDone(state.stickers)) return 'done';
      if (isStickersPending(state.stickers)) return 'pending';
      return 'todo';
    case 'buddy':
      return currentStage === 'ready_to_share' ? 'todo' : 'blocked';
    case 'survey':
      return isSurveyDone(state.survey) ? 'done' : 'todo';
    default:
      return 'todo';
  }
}

export function computeCurrentStage(state: OnboardingState, variant: OnboardingVariant): OnboardingStage {
  const prepDone = getSubflowsForStage(variant, 'preparation').every(
    (s) => computeSubflowState(s.id, state, variant, 'ready_to_share') === 'done',
  );
  if (!prepDone) return 'preparation';

  const progressDone = getSubflowsForStage(variant, 'in_progress').every(
    (s) => computeSubflowState(s.id, state, variant, 'ready_to_share') === 'done',
  );
  if (!progressDone) return 'in_progress';

  return 'ready_to_share';
}

export function shouldAutoSendContract(
  state: OnboardingState,
  variant: OnboardingVariant,
  previousStage: OnboardingStage,
  currentStage: OnboardingStage,
): boolean {
  return previousStage === 'preparation' && currentStage === 'in_progress' && !state.contract.sent;
}
