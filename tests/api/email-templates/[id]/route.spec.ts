import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/email-template/read', () => ({
  readEmailTemplate: vi.fn(),
}));

vi.mock('@/actions/email-template/update', () => ({
  updateEmailTemplate: vi.fn(),
}));

vi.mock('@/actions/email-template/delete', () => ({
  deleteEmailTemplate: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/email-templates/[id]/route';
import { auth } from '@/auth';
import { readEmailTemplate } from '@/actions/email-template/read';
import { updateEmailTemplate } from '@/actions/email-template/update';
import { deleteEmailTemplate } from '@/actions/email-template/delete';
import { emailTemplate } from '../../../builders/email-template.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

const mockAdminUser = {
  id: 'admin-id',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  banned: false,
};

const mockRegularUser = {
  id: 'user-id',
  name: 'User',
  email: 'user@example.com',
  role: 'user',
  banned: false,
};

describe('API Route - GET /api/email-templates/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when a regular user reads a template', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockRegularUser } as never);
    const response = await GET({} as never, { params: Promise.resolve({ id: validId }) });
    expect(response.status).toBe(403);
    expect(readEmailTemplate).not.toHaveBeenCalled();
  });

  it('returns 200 when admin reads a template', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    vi.mocked(readEmailTemplate).mockResolvedValueOnce(emailTemplate({ id: validId }));

    const response = await GET({} as never, { params: Promise.resolve({ id: validId }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toBe(validId);
    expect(readEmailTemplate).toHaveBeenCalledWith(validId);
  });
});

describe('API Route - PUT /api/email-templates/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 when admin updates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    const body = emailTemplate({ id: validId });
    vi.mocked(updateEmailTemplate).mockResolvedValueOnce(body);

    const request = { json: vi.fn().mockResolvedValue(body) } as never;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });

    expect(response.status).toBe(204);
    expect(updateEmailTemplate).toHaveBeenCalledTimes(1);
  });
});

describe('API Route - DELETE /api/email-templates/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 when admin deletes', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    vi.mocked(deleteEmailTemplate).mockResolvedValueOnce(undefined);

    const response = await DELETE({} as never, { params: Promise.resolve({ id: validId }) });

    expect(response.status).toBe(204);
    expect(deleteEmailTemplate).toHaveBeenCalledWith(validId);
  });
});
