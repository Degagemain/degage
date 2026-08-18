import { describe, expect, it } from 'vitest';
import { pickEmailTemplateTranslation } from '@/actions/email-template/pick-translation';

describe('pickEmailTemplateTranslation', () => {
  const translations = [
    { locale: 'en', variables: { SUBJECT: 'EN' } },
    { locale: 'nl', variables: { SUBJECT: 'NL' } },
    { locale: 'fr', variables: { SUBJECT: 'FR' } },
  ];

  it('picks the requested locale', () => {
    expect(pickEmailTemplateTranslation(translations, 'fr')?.variables.SUBJECT).toBe('FR');
  });

  it('falls back to nl when locale is missing', () => {
    expect(pickEmailTemplateTranslation(translations, 'de')?.variables.SUBJECT).toBe('NL');
    expect(pickEmailTemplateTranslation(translations, null)?.variables.SUBJECT).toBe('NL');
  });

  it('falls back to the first translation when nl is absent', () => {
    const withoutNl = [
      { locale: 'en', variables: { SUBJECT: 'EN' } },
      { locale: 'fr', variables: { SUBJECT: 'FR' } },
    ];
    expect(pickEmailTemplateTranslation(withoutNl, 'de')?.variables.SUBJECT).toBe('EN');
  });
});
