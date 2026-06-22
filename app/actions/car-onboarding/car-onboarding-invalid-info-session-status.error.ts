export class CarOnboardingInvalidInfoSessionStatusError extends Error {
  constructor(message: string = 'Info session status does not allow this action') {
    super(message);
    this.name = 'CarOnboardingInvalidInfoSessionStatusError';
  }
}
