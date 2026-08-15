import { AppError } from '@/actions/app.error';

export class CarOnboardingPlayConnectorMissingError extends AppError {
  constructor(message = 'Owner play connector is not attached') {
    super('play_connector_missing', message, 400);
  }
}
