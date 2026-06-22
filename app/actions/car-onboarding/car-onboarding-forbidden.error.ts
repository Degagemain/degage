export class CarOnboardingForbiddenError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'CarOnboardingForbiddenError';
  }
}
