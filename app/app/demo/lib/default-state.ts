import type { OnboardingState } from './types';

export const createDefaultOnboardingState = (): OnboardingState => ({
  'degapp-account': {
    hasAccount: null,
    email: '',
    password: '',
    connected: false,
  },
  'info-session': {
    enrolledSessionId: null,
    sessionFinished: false,
  },
  'car-info': {
    vin: '',
    mileage: '',
    brand: '',
    model: '',
    year: '',
    documentsUploaded: false,
    pinkFormUploaded: false,
  },
  'insurance-info': {
    startDate: '',
    insurer: '',
  },
  'start-datum': {
    month: '',
    year: '',
  },
  'car-damage': {
    photos: [],
  },
  instapwaarde: {
    agreed: null,
    proposalValue: '',
    proposalMessage: '',
  },
  contract: {
    sent: false,
    signed: false,
  },
  insurance: {},
  'parking-card': {
    manuallyDone: false,
  },
  'admin-afhandeling': {
    'starter-bundle': false,
    'degapp-fiche': false,
    'website-map': false,
    'car-email': false,
  },
  stickers: {
    template: null,
    locked: false,
  },
  buddy: {},
  survey: {
    opened: false,
  },
});
