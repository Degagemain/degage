import { unauthorizedResponse } from '@/api/utils';

export const unauthorizedCronResponse = (request: Request): Response | null => {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return unauthorizedResponse('Cron is not configured');
  }
  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${secret}`) {
    return unauthorizedResponse();
  }
  return null;
};
