export class CarOnboardingInvalidInsurerStatusError extends Error {
  constructor(message: string = 'Insurer status does not allow this action') {
    super(message);
    this.name = 'CarOnboardingInvalidInsurerStatusError';
  }
}
