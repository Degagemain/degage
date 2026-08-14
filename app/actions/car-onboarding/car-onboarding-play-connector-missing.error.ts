export class CarOnboardingPlayConnectorMissingError extends Error {
  constructor(message = 'Owner play connector is not attached') {
    super(message);
    this.name = 'CarOnboardingPlayConnectorMissingError';
  }
}
