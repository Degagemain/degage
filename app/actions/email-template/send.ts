import { NotFoundError } from '@/actions/app.error';
import type { TemplatesEnum } from '@/domain/email-template.model';
import { sendResendTemplateEmail } from '@/integrations/resend';
import { dbEmailTemplateGetByCode } from '@/storage/email-template/email-template.read';
import { pickEmailTemplateTranslation } from './pick-translation';

export const interpolateEmailVariables = (variables: Record<string, string | number>): Record<string, string | number> => {
  const nestedKeys = new Set<string>();
  const result: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (typeof value !== 'string') {
      result[key] = value;
      continue;
    }
    result[key] = value.replace(/\{\{\{(\w+)\}\}\}/g, (match, name: string) => {
      if (!(name in variables)) {
        return match;
      }
      nestedKeys.add(name);
      return String(variables[name]);
    });
  }

  for (const key of nestedKeys) {
    delete result[key];
  }

  return result;
};

export type SendEmailByCodeOptions = {
  to: string;
  code: TemplatesEnum;
  locale: string | null | undefined;
  variables: Record<string, string | number>;
  subject?: string;
  headers?: Record<string, string>;
  replyTo?: string | string[];
};

export const sendEmailByCode = async (options: SendEmailByCodeOptions): Promise<{ id: string | null }> => {
  const template = await dbEmailTemplateGetByCode(options.code);
  if (!template) {
    throw new NotFoundError(`Email template '${options.code}' not found`);
  }

  const translation = pickEmailTemplateTranslation(template.translations, options.locale);
  const merged = interpolateEmailVariables({
    ...(translation?.variables ?? {}),
    ...options.variables,
  });
  const subject = options.subject ?? (typeof merged.SUBJECT === 'string' ? merged.SUBJECT : undefined);

  return sendResendTemplateEmail({
    to: options.to,
    templateId: template.designId,
    variables: merged,
    subject,
    headers: options.headers,
    replyTo: options.replyTo,
  });
};
