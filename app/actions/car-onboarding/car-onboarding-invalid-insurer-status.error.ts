import { AppError } from '@/actions/app.error';

export class CarOnboardingInvalidInsurerStatusError extends AppError {
  constructor(message: string = 'Insurer status does not allow this action') {
    super('invalid_insurer_status', message, 400);
  }
}
