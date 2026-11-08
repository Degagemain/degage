import { AppError } from '@/actions/app.error';

export class CarOnboardingGsheetMappingError extends AppError {
  constructor(message: string) {
    super('car_onboarding_gsheet_mapping_error', message, 400);
  }
}

export class CarOnboardingGsheetMissingDataError extends AppError {
  constructor(message: string) {
    super('car_onboarding_gsheet_missing_data', message, 400);
  }
}
