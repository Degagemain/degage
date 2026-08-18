import type { EmailTemplate } from '@/domain/email-template.model';
import { TemplatesEnum } from '@/domain/email-template.model';

export const emailTemplate = (data: Partial<EmailTemplate> = {}): EmailTemplate => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    code: data.code || TemplatesEnum.VerificationEmail,
    designId: data.designId || 'button-email',
    translations: data.translations || [
      {
        locale: 'en',
        variables: { SUBJECT: 'Confirm your email', HEADING: 'Confirm your email', BUTTON_URL: '' },
      },
      {
        locale: 'nl',
        variables: { SUBJECT: 'Bevestig je e-mailadres', HEADING: 'Bevestig je e-mailadres', BUTTON_URL: '' },
      },
    ],
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
