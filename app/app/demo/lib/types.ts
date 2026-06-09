export type OnboardingVariant = 'new-car' | 'regular';

export type OnboardingStage = 'preparation' | 'in_progress' | 'ready_to_share';

export type SubflowState = 'blocked' | 'todo' | 'pending' | 'done';

export type SubflowId =
  | 'degapp-account'
  | 'info-session'
  | 'car-info'
  | 'insurance-info'
  | 'start-datum'
  | 'car-damage'
  | 'instapwaarde'
  | 'contract'
  | 'insurance'
  | 'parking-card'
  | 'admin-afhandeling'
  | 'stickers'
  | 'buddy'
  | 'survey';

export type DegappAccountData = {
  hasAccount: boolean | null;
  email: string;
  password: string;
  connected: boolean;
};

export type InfoSessionData = {
  enrolledSessionId: string | null;
  sessionFinished: boolean;
};

export type CarInfoData = {
  vin: string;
  mileage: string;
  brand: string;
  model: string;
  year: string;
  documentsUploaded: boolean;
  pinkFormUploaded: boolean;
};

export type InsuranceInfoData = {
  startDate: string;
  insurer: string;
};

export type StartDatumData = {
  month: string;
  year: string;
};

export type CarDamageData = {
  photos: string[];
};

export type InstapwaardeData = {
  agreed: boolean | null;
  proposalValue: string;
  proposalMessage: string;
};

export type ContractData = {
  sent: boolean;
  signed: boolean;
};

export type InsuranceProgressData = Record<string, never>;

export type ParkingCardData = {
  manuallyDone: boolean;
};

export type AdminHandlingTaskId = 'starter-bundle' | 'degapp-fiche' | 'website-map' | 'car-email';

export type AdminHandlingData = Record<AdminHandlingTaskId, boolean>;

export type StickersData = {
  template: 'gray' | 'black' | 'white' | null;
  locked: boolean;
};

export type BuddyData = Record<string, never>;

export type SurveyData = {
  opened: boolean;
};

export type SubflowDataMap = {
  'degapp-account': DegappAccountData;
  'info-session': InfoSessionData;
  'car-info': CarInfoData;
  'insurance-info': InsuranceInfoData;
  'start-datum': StartDatumData;
  'car-damage': CarDamageData;
  instapwaarde: InstapwaardeData;
  contract: ContractData;
  insurance: InsuranceProgressData;
  'parking-card': ParkingCardData;
  'admin-afhandeling': AdminHandlingData;
  stickers: StickersData;
  buddy: BuddyData;
  survey: SurveyData;
};

export type OnboardingState = {
  [K in SubflowId]: SubflowDataMap[K];
};
