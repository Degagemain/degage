import type { EmailDesign } from '@/domain/email-design.model';
import { NotFoundError } from '@/actions/app.error';
import { requireResendClient } from './resend-client';
import { ResendRequestError } from './resend-request.error';

export const readEmailDesign = async (id: string): Promise<EmailDesign> => {
  const resend = requireResendClient();
  const result = await resend.templates.get(id);
  if (result.error) {
    if (result.error.name === 'not_found') {
      throw new NotFoundError('Email design not found');
    }
    throw new ResendRequestError(result.error.message, result.error.statusCode ?? 502);
  }
  const template = result.data;
  if (!template) {
    throw new NotFoundError('Email design not found');
  }

  return {
    id: template.id,
    name: template.name,
    alias: template.alias,
    status: template.status,
    variables: (template.variables ?? []).map((variable) => ({
      key: variable.key,
      type: variable.type,
      fallbackValue: variable.fallback_value,
    })),
  };
};
