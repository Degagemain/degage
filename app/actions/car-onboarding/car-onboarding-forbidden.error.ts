import { AppError } from '@/actions/app.error';

export class CarOnboardingForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super('forbidden', message, 403);
  }
}
