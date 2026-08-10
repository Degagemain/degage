export class CarOnboardingAdminModeUnavailableError extends Error {
  constructor(message = 'Admin mode play connector is unavailable') {
    super(message);
    this.name = 'CarOnboardingAdminModeUnavailableError';
  }
}
