import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? 'Neurotic <onboarding@resend.dev>';

const resend = apiKey ? new Resend(apiKey) : null;

export type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
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
