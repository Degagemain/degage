export class CarOnboardingLockedError extends Error {
  constructor(message: string = 'Car onboarding is locked and cannot be updated') {
    super(message);
    this.name = 'CarOnboardingLockedError';
  }
}
