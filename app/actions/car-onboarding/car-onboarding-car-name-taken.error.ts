export class CarOnboardingCarNameTakenError extends Error {
  constructor(message = 'Car name is already taken') {
    super(message);
    this.name = 'CarOnboardingCarNameTakenError';
  }
}
