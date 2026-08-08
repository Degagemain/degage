export class CarOnboardingNotConfirmableError extends Error {
  constructor(message: string = 'Car onboarding preparation cannot be confirmed yet') {
    super(message);
    this.name = 'CarOnboardingNotConfirmableError';
  }
}
