import { AppError } from '@/actions/app.error';

export class CarOnboardingLockedError extends AppError {
  constructor(message: string = 'Car onboarding is locked and cannot be updated') {
    super('forbidden', message, 403);
  }
}
