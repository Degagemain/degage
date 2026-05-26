import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue(null) } },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

vi.mock('@/actions/notion/sync-page-to-documentation', () => ({
  syncNotionPageToDocumentation: vi.fn(),
  deleteNotionDocumentation: vi.fn(),
}));

vi.mock('@/actions/notion/verify-webhook-signature', () => ({
  verifyNotionWebhookSignature: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: { exception: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { POST } from '@/api/webhooks/notion/route';
import { deleteNotionDocumentation, syncNotionPageToDocumentation } from '@/actions/notion/sync-page-to-documentation';
import { logger } from '@/lib/logger';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/webhooks/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/webhooks/notion', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and calls syncNotionPageToDocumentation for page.content_updated', async () => {
    const request = makeRequest({ type: 'page.content_updated', entity: { id: 'page-1', type: 'page' } });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(syncNotionPageToDocumentation).toHaveBeenCalledWith('page-1');
  });

  it('returns 200 and calls deleteNotionDocumentation for page.deleted', async () => {
    const request = makeRequest({ type: 'page.deleted', entity: { id: 'page-1', type: 'page' } });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(deleteNotionDocumentation).toHaveBeenCalledWith('page-1');
  });

  it('returns 200 and logs the error when sync throws', async () => {
    const error = new Error('Could not find block with ID: abc123');
    vi.mocked(syncNotionPageToDocumentation).mockRejectedValueOnce(error);

    const request = makeRequest({ type: 'page.content_updated', entity: { id: 'page-1', type: 'page' } });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(logger.exception).toHaveBeenCalledWith(error, { webhook: 'notion', pageId: 'page-1' });
  });

  it('returns 200 and logs the error when delete throws', async () => {
    const error = new Error('delete failed');
    vi.mocked(deleteNotionDocumentation).mockRejectedValueOnce(error);

    const request = makeRequest({ type: 'page.deleted', entity: { id: 'page-2', type: 'page' } });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(logger.exception).toHaveBeenCalledWith(error, { webhook: 'notion', pageId: 'page-2' });
  });

  it('returns 200 for non-page entities', async () => {
    const request = makeRequest({ type: 'database.updated', entity: { id: 'db-1', type: 'database' } });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(syncNotionPageToDocumentation).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON', async () => {
    const request = new NextRequest('http://localhost/api/webhooks/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
