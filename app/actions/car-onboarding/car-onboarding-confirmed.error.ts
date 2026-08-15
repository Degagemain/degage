import { AppError } from '@/actions/app.error';

export class CarOnboardingConfirmedError extends AppError {
  constructor(message: string = 'Car onboarding preparation is confirmed and cannot be updated') {
    super('forbidden', message, 403);
  }
}
