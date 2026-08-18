import { describe, expect, it } from 'vitest';
import { TemplatesEnum, emailTemplateSchema } from '@/domain/email-template.model';

describe('emailTemplateSchema', () => {
  it('accepts a valid template', () => {
    const result = emailTemplateSchema.parse({
      id: null,
      code: TemplatesEnum.VerificationEmail,
      designId: 'button-email',
      translations: [{ locale: 'en', variables: { SUBJECT: 'Hello' } }],
    });

    expect(result.code).toBe('verification-email');
    expect(result.designId).toBe('button-email');
  });

  it('rejects an unknown code', () => {
    const result = emailTemplateSchema.safeParse({
      id: null,
      code: 'unknown-email',
      designId: 'button-email',
      translations: [],
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty design id', () => {
    const result = emailTemplateSchema.safeParse({
      id: null,
      code: TemplatesEnum.ResetPasswordEmail,
      designId: '',
      translations: [],
    });

    expect(result.success).toBe(false);
  });
});
