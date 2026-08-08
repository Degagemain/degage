export class CarOnboardingConfirmedError extends Error {
  constructor(message: string = 'Car onboarding preparation is confirmed and cannot be updated') {
    super(message);
    this.name = 'CarOnboardingConfirmedError';
  }
}
