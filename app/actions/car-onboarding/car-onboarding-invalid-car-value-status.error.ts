import { AppError } from '@/actions/app.error';

export class CarOnboardingInvalidCarValueStatusError extends AppError {
  constructor(message: string = 'Car value status does not allow this action') {
    super('invalid_car_value_status', message, 400);
  }
}
