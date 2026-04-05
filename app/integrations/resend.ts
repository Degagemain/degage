import { Resend } from 'resend';

import { type UILocale, defaultUILocale, uiLocales } from '@/i18n/locales';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? 'Neurotic <onboarding@resend.dev>';

const resend = apiKey ? new Resend(apiKey) : null;

export enum TemplatesEnum {
  VerificationEmail = 'verification-email',
  ResetPasswordEmail = 'reset-password-email',
}

export function getTemplate(template: TemplatesEnum, locale: string | null | undefined): string {
  const code = locale && uiLocales.includes(locale as UILocale) ? locale : defaultUILocale;
  return `${template}-${code}`;
}

export type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
  replyTo?: string | string[];
};

export type SendTemplatedEmailOptions = {
  to: string;
  template: TemplatesEnum;
  locale: string | null | undefined;
  variables: Record<string, string | number>;
  /** If set, overrides the template’s default subject. Omit to use the subject configured in Resend. */
  subject?: string;
  headers?: Record<string, string>;
  replyTo?: string | string[];
};

/**
 * Send an email via Resend. No-ops if RESEND_API_KEY is not set (e.g. local dev without Resend).
 * Do not await this in auth flows to avoid timing attacks; use void sendEmail(...).
 */
export const getResendClient = (): Resend | null => resend;

export async function sendEmail(options: SendEmailOptions): Promise<{ id: string | null }> {
  if (!resend) return { id: null };
  const result = await resend.emails.send({
    from,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
    headers: options.headers,
  });
  const id = typeof result?.data?.id === 'string' ? result.data.id : null;
  return { id };
}

export async function sendTemplatedEmail(options: SendTemplatedEmailOptions): Promise<{ id: string | null }> {
  if (!resend) return { id: null };
  const templateId = getTemplate(options.template, options.locale);
  const result = await resend.emails.send({
    from,
    to: options.to,
    replyTo: options.replyTo,
    headers: options.headers,
    ...(options.subject !== undefined ? { subject: options.subject } : {}),
    template: {
      id: templateId,
      variables: options.variables,
    },
  });
  const id = typeof result?.data?.id === 'string' ? result.data.id : null;
  return { id };
}
