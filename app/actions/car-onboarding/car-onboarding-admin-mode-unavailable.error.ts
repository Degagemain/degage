import { AppError } from '@/actions/app.error';

export class CarOnboardingAdminModeUnavailableError extends AppError {
  constructor(message = 'Admin mode play connector is unavailable') {
    super('admin_mode_unavailable', message, 503);
  }
}
