import { AppError } from '@/actions/app.error';

export class ResendRequestError extends AppError {
  constructor(message: string, httpStatus = 502) {
    super('resend_error', message, httpStatus);
  }
}
