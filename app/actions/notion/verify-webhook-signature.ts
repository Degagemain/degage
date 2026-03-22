import { createHmac, timingSafeEqual } from 'crypto';

export const verifyNotionWebhookSignature = (rawBody: string, signatureHeader: string | null, verificationToken: string): boolean => {
  if (!signatureHeader || !verificationToken) {
    return false;
  }
  const calculated = `sha256=${createHmac('sha256', verificationToken).update(rawBody, 'utf8').digest('hex')}`;
  try {
    return timingSafeEqual(Buffer.from(calculated), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
};
