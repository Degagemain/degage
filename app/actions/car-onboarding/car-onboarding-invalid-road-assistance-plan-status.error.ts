import { AppError } from '@/actions/app.error';

export class CarOnboardingInvalidRoadAssistancePlanStatusError extends AppError {
  constructor(message: string = 'Road assistance plan status does not allow this action') {
    super('invalid_road_assistance_plan_status', message, 400);
  }
}
