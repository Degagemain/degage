import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/email-template/search', () => ({
  searchEmailTemplates: vi.fn(),
}));

vi.mock('@/actions/email-template/create', () => ({
  createEmailTemplate: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/email-templates/route';
import { auth } from '@/auth';
import { searchEmailTemplates } from '@/actions/email-template/search';
import { createEmailTemplate } from '@/actions/email-template/create';
import { emailTemplate } from '../../builders/email-template.builder';

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

describe('API Route - GET /api/email-templates', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session exists', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = { nextUrl: new URL('http://localhost/api/email-templates') } as never;
    const response = await GET(request);
    expect(response.status).toBe(401);
    expect(searchEmailTemplates).not.toHaveBeenCalled();
  });

  it('returns 403 when a regular user lists templates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockRegularUser } as never);
    const request = { nextUrl: new URL('http://localhost/api/email-templates') } as never;
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it('returns 200 when admin lists templates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    vi.mocked(searchEmailTemplates).mockResolvedValueOnce({ records: [emailTemplate()], total: 1 });

    const request = { nextUrl: new URL('http://localhost/api/email-templates') } as never;
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.total).toBe(1);
    expect(searchEmailTemplates).toHaveBeenCalledTimes(1);
  });
});

describe('API Route - POST /api/email-templates', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when a regular user attempts to create', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockRegularUser } as never);
    const request = { json: vi.fn().mockResolvedValue(emailTemplate({ id: null })) } as never;
    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(createEmailTemplate).not.toHaveBeenCalled();
  });

  it('returns 201 when admin creates a template', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    const created = emailTemplate({ id: 'new-id' });
    vi.mocked(createEmailTemplate).mockResolvedValueOnce(created);

    const request = { json: vi.fn().mockResolvedValue({ ...created, id: null }) } as never;
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.code).toBe('verification-email');
    expect(createEmailTemplate).toHaveBeenCalledTimes(1);
  });
});
