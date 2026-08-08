export class CarOnboardingInvalidShareStartDateError extends Error {
  constructor(message: string = 'Share start date is invalid') {
    super(message);
    this.name = 'CarOnboardingInvalidShareStartDateError';
  }
}
