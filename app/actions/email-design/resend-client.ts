import { getResendClient } from '@/integrations/resend';
import { ResendNotConfiguredError } from './resend-not-configured.error';

export const requireResendClient = () => {
  const client = getResendClient();
  if (!client) {
    throw new ResendNotConfiguredError();
  }
  return client;
};
