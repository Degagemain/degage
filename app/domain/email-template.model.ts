import * as z from 'zod';

export enum TemplatesEnum {
  VerificationEmail = 'verification-email',
  ResetPasswordEmail = 'reset-password-email',
  SimulationResultsEmail = 'simulation-results-email',
  SimulationResultsSupportEmail = 'simulation-results-support',
  SimulationManualReviewEmail = 'simulation-manual-review-email',
  SimulationManualReviewSupportEmail = 'simulation-manual-review-support',
  CarOnboardingPreparationNudgeEmail = 'car-onboarding-preparation-nudge-email',
}

export const emailTemplateCodeValues = [
  TemplatesEnum.VerificationEmail,
  TemplatesEnum.ResetPasswordEmail,
  TemplatesEnum.SimulationResultsEmail,
  TemplatesEnum.SimulationResultsSupportEmail,
  TemplatesEnum.SimulationManualReviewEmail,
  TemplatesEnum.SimulationManualReviewSupportEmail,
  TemplatesEnum.CarOnboardingPreparationNudgeEmail,
] as const;

export const emailTemplateCodeSchema = z.enum(emailTemplateCodeValues);
export type EmailTemplateCode = z.infer<typeof emailTemplateCodeSchema>;

export const BUTTON_EMAIL_DESIGN_ALIAS = 'button-email';
export const SIMULATION_RESULTS_EMAIL_DESIGN_ALIAS = 'simulation-results-email';
export const SIMULATION_MANUAL_REVIEW_EMAIL_DESIGN_ALIAS = 'simulation-manual-review-email';

export const emailTemplateTranslationSchema = z.object({
  locale: z.string().min(2).max(5),
  variables: z.record(z.string(), z.string()),
});

export type EmailTemplateTranslation = z.infer<typeof emailTemplateTranslationSchema>;

export const emailTemplateSchema = z
  .object({
    id: z.uuid().nullable(),
    code: emailTemplateCodeSchema,
    designId: z.string().min(1).max(200),
    translations: z.array(emailTemplateTranslationSchema).default([]),
    createdAt: z.coerce.date().nullable().default(null),
    updatedAt: z.coerce.date().nullable().default(null),
  })
  .strict();

export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
