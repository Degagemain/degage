import { AppError } from '@/actions/app.error';

export class DocumentationShortLinkTakenError extends AppError {
  constructor(message = 'Another article already uses this short link') {
    super('short_link_taken', message, 409);
  }
}

export const isDocumentationShortLinkUniqueError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'P2002') {
    return false;
  }
  const meta = 'meta' in error ? error.meta : undefined;
  const target = meta && typeof meta === 'object' && 'target' in meta ? meta.target : undefined;
  const text = Array.isArray(target) ? target.join(' ') : typeof target === 'string' ? target : '';
  return text.includes('shortLink');
};
