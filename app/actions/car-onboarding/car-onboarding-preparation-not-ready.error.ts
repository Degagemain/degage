export class CarOnboardingPreparationNotReadyError extends Error {
  constructor(message: string = 'Car onboarding preparation is not ready') {
    super(message);
    this.name = 'CarOnboardingPreparationNotReadyError';
  }
}
