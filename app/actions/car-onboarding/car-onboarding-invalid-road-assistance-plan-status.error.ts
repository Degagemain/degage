export class CarOnboardingInvalidRoadAssistancePlanStatusError extends Error {
  constructor(message: string = 'Road assistance plan status does not allow this action') {
    super(message);
    this.name = 'CarOnboardingInvalidRoadAssistancePlanStatusError';
  }
}
