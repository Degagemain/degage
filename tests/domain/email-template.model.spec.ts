import { describe, expect, it } from 'vitest';
import { TemplatesEnum, emailTemplateCodeValues, emailTemplateSchema } from '@/domain/email-template.model';
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import nl from '../../messages/nl.json';

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

describe('admin email template code labels', () => {
  it('defines a label for every template code in en, nl, and fr', () => {
    const locales = { en, nl, fr };

    for (const [locale, messages] of Object.entries(locales)) {
      const codes = messages.admin.emailTemplates.codes as Record<string, string>;
      for (const code of emailTemplateCodeValues) {
        expect(codes[code], `${locale} missing admin.emailTemplates.codes.${code}`).toEqual(expect.any(String));
        expect(codes[code]?.trim().length, `${locale} empty admin.emailTemplates.codes.${code}`).toBeGreaterThan(0);
      }
    }
  });
});
