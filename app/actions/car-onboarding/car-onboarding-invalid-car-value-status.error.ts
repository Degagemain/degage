export class CarOnboardingInvalidCarValueStatusError extends Error {
  constructor(message: string = 'Car value status does not allow this action') {
    super(message);
    this.name = 'CarOnboardingInvalidCarValueStatusError';
  }
}
