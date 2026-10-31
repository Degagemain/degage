import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/feature-flag/read', () => ({
  readFeatureFlag: vi.fn(),
}));

vi.mock('@/actions/feature-flag/update-enabled', () => ({
  updateFeatureFlagEnabled: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { auth } from '@/auth';
import { readFeatureFlag } from '@/actions/feature-flag/read';
import { updateFeatureFlagEnabled } from '@/actions/feature-flag/update-enabled';
import { GET, PATCH } from '@/api/feature-flags/[id]/route';
import { featureFlag } from '../../../builders/feature-flag.builder';

describe('GET /api/feature-flags/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 when unauthenticated and found', async () => {
    const flag = featureFlag({ id: '550e8400-e29b-41d4-a716-446655440000' });
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    vi.mocked(readFeatureFlag).mockResolvedValueOnce(flag);
    const request = new Request('http://localhost/api/feature-flags/550e8400-e29b-41d4-a716-446655440000');
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await GET(request as any, context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.code).toBe('support-chat');
  });
});

describe('PATCH /api/feature-flags/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = new Request('http://localhost/api/feature-flags/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    });
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await PATCH(request as any, context);
    expect(response.status).toBe(401);
  });

  it('returns 403 when user is not admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: '1', role: 'user', name: 'U', email: 'u@x.com' },
      session: {} as any,
    } as never);
    const request = new Request('http://localhost/api/feature-flags/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    });
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await PATCH(request as any, context);
    expect(response.status).toBe(403);
  });

  it('returns 200 with updated flag when admin and valid payload', async () => {
    const updated = featureFlag({
      id: '550e8400-e29b-41d4-a716-446655440000',
      enabled: false,
    });
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: '1', role: 'admin', name: 'A', email: 'a@x.com' },
      session: {} as any,
    } as never);
    vi.mocked(updateFeatureFlagEnabled).mockResolvedValueOnce(updated);
    const request = new Request('http://localhost/api/feature-flags/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: false }),
    });
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await PATCH(request as any, context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.enabled).toBe(false);
  });
});
