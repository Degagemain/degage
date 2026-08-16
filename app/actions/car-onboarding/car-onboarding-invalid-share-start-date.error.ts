import { AppError } from '@/actions/app.error';

export class CarOnboardingInvalidShareStartDateError extends AppError {
  constructor(message: string = 'Share start date is invalid') {
    super('invalid_share_start_date', message, 400);
  }
}
