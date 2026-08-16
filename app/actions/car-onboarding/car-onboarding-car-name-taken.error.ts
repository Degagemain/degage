import { AppError } from '@/actions/app.error';

export class CarOnboardingCarNameTakenError extends AppError {
  constructor(message = 'Car name is already taken') {
    super('car_name_taken', message, 409);
  }
}
