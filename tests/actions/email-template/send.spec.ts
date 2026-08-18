import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/email-template/email-template.read', () => ({
  dbEmailTemplateGetByCode: vi.fn(),
}));

vi.mock('@/integrations/resend', () => ({
  sendResendTemplateEmail: vi.fn(),
}));

import { sendEmailByCode } from '@/actions/email-template/send';
import { NotFoundError } from '@/actions/app.error';
import { dbEmailTemplateGetByCode } from '@/storage/email-template/email-template.read';
import { sendResendTemplateEmail } from '@/integrations/resend';
import { TemplatesEnum } from '@/domain/email-template.model';
import { emailTemplate } from '../../builders/email-template.builder';

describe('sendEmailByCode', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('merges translated variables with input variables and sends by design id', async () => {
    vi.mocked(dbEmailTemplateGetByCode).mockResolvedValueOnce(
      emailTemplate({
        code: TemplatesEnum.VerificationEmail,
        designId: 'button-email',
        translations: [
          { locale: 'en', variables: { SUBJECT: 'Confirm your email', HEADING: 'Confirm', BUTTON_URL: '' } },
          { locale: 'nl', variables: { SUBJECT: 'Bevestig', HEADING: 'Bevestig', BUTTON_URL: '' } },
        ],
      }),
    );
    vi.mocked(sendResendTemplateEmail).mockResolvedValueOnce({ id: 'email-1' });

    const result = await sendEmailByCode({
      to: 'user@example.com',
      code: TemplatesEnum.VerificationEmail,
      locale: 'en',
      variables: { BUTTON_URL: 'https://app.example/verify' },
    });

    expect(result).toEqual({ id: 'email-1' });
    expect(sendResendTemplateEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      templateId: 'button-email',
      variables: {
        SUBJECT: 'Confirm your email',
        HEADING: 'Confirm',
        BUTTON_URL: 'https://app.example/verify',
      },
      subject: 'Confirm your email',
      headers: undefined,
      replyTo: undefined,
    });
  });

  it('throws when the template code is missing', async () => {
    vi.mocked(dbEmailTemplateGetByCode).mockResolvedValueOnce(null);

    await expect(
      sendEmailByCode({
        to: 'user@example.com',
        code: TemplatesEnum.ResetPasswordEmail,
        locale: 'nl',
        variables: { BUTTON_URL: 'https://app.example/reset' },
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(sendResendTemplateEmail).not.toHaveBeenCalled();
  });

  it('interpolates nested placeholders and omits those keys from the payload', async () => {
    vi.mocked(dbEmailTemplateGetByCode).mockResolvedValueOnce(
      emailTemplate({
        code: TemplatesEnum.SimulationResultsSupportEmail,
        designId: 'button-email',
        translations: [
          {
            locale: 'nl',
            variables: {
              SUBJECT: 'Support',
              BODY: 'Sent to {{{RECIPIENT_EMAIL}}}. Purchased: {{{IS_PURCHASED}}}.',
              BUTTON_URL: '',
            },
          },
        ],
      }),
    );
    vi.mocked(sendResendTemplateEmail).mockResolvedValueOnce({ id: 'email-2' });

    await sendEmailByCode({
      to: 'support@example.com',
      code: TemplatesEnum.SimulationResultsSupportEmail,
      locale: 'nl',
      variables: { BUTTON_URL: 'https://admin.example/sim', RECIPIENT_EMAIL: 'u@x.co', IS_PURCHASED: 'Ja' },
    });

    expect(sendResendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          SUBJECT: 'Support',
          BODY: 'Sent to u@x.co. Purchased: Ja.',
          BUTTON_URL: 'https://admin.example/sim',
        },
      }),
    );
  });
});
