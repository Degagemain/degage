import { describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/system-parameter/read', () => ({
  readSystemParameter: vi.fn(),
}));

vi.mock('@/actions/system-parameter/update-values', () => ({
  updateSystemParameterValues: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { auth } from '@/auth';
import { readSystemParameter } from '@/actions/system-parameter/read';
import { updateSystemParameterValues } from '@/actions/system-parameter/update-values';
import { GET, PATCH } from '@/api/system-parameters/[id]/route';
import { systemParameter } from '../../../builders/system-parameter.builder';

describe('GET /api/system-parameters/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = new Request('http://localhost/api/system-parameters/123');
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await GET(request as any, context);
    expect(response.status).toBe(401);
  });

  it('returns 200 with parameter when admin and found', async () => {
    const param = systemParameter({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const session = {
      user: { id: '1', role: 'admin', name: 'A', email: 'a@x.com' },
      session: {} as any,
    };
    vi.mocked(auth.api.getSession).mockResolvedValue(session);
    vi.mocked(readSystemParameter).mockResolvedValueOnce(param);
    const request = new Request('http://localhost/api/system-parameters/550e8400-e29b-41d4-a716-446655440000');
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await GET(request as any, context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.code).toBe('maxAgeYears');
  });
});

describe('PATCH /api/system-parameters/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const request = new Request('http://localhost/api/system-parameters/123', {
      method: 'PATCH',
      body: JSON.stringify({ valueNumber: 20 }),
    });
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await PATCH(request as any, context);
    expect(response.status).toBe(401);
  });

  it('returns 200 with updated parameter when admin and valid payload', async () => {
    const updated = systemParameter({
      id: '550e8400-e29b-41d4-a716-446655440000',
      valueNumber: 20,
    });
    const session = {
      user: { id: '1', role: 'admin', name: 'A', email: 'a@x.com' },
      session: {} as any,
    };
    vi.mocked(auth.api.getSession).mockResolvedValue(session);
    vi.mocked(updateSystemParameterValues).mockResolvedValueOnce(updated);
    const request = new Request('http://localhost/api/system-parameters/550e8400-e29b-41d4-a716-446655440000', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valueNumber: 20 }),
    });
    const context = { params: Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440000' }) };
    const response = await PATCH(request as any, context);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.valueNumber).toBe(20);
  });
});
