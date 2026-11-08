import { AppError } from '@/actions/app.error';

export class CarOnboardingOwnerMissingError extends AppError {
  constructor(message = 'Car onboarding has no owner') {
    super('car_onboarding_owner_missing', message, 400);
  }
}

export class CarOnboardingContractTypeMissingError extends AppError {
  constructor(message = 'Car-onboarding contract type is not configured') {
    super('car_onboarding_contract_type_missing', message, 400);
  }
}

export class CarOnboardingContractMissingError extends AppError {
  constructor(message = 'Car onboarding has no contract yet') {
    super('car_onboarding_contract_missing', message, 404);
  }
}

export class CarOnboardingContractAlreadyStartedError extends AppError {
  constructor(message = 'Car onboarding contract was already started') {
    super('car_onboarding_contract_already_started', message, 409);
  }
}
