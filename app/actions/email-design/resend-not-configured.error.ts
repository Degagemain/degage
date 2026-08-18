import { AppError } from '@/actions/app.error';

export class ResendNotConfiguredError extends AppError {
  constructor() {
    super('resend_not_configured', 'Resend is not configured', 503);
  }
}
