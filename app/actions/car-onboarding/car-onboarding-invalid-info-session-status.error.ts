import { AppError } from '@/actions/app.error';

export class CarOnboardingInvalidInfoSessionStatusError extends AppError {
  constructor(message: string = 'Info session status does not allow this action') {
    super('invalid_info_session_status', message, 400);
  }
}
