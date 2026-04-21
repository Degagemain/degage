import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock('@/actions/car-info/read', () => ({
  readCarInfo: vi.fn(),
}));

vi.mock('@/actions/car-info/update', () => ({
  updateCarInfo: vi.fn(),
}));

vi.mock('@/actions/car-info/delete', () => ({
  deleteCarInfo: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/car-infos/[id]/route';
import { auth } from '@/auth';
import { readCarInfo } from '@/actions/car-info/read';
import { updateCarInfo } from '@/actions/car-info/update';
import { deleteCarInfo } from '@/actions/car-info/delete';

const adminUser = { id: 'admin-id', name: 'Admin', email: 'a@example.com', role: 'admin', banned: false };
const regularUser = { id: 'user-id', name: 'User', email: 'u@example.com', role: 'user', banned: false };

const VALID_ID = 'a1b2c3d4-e5f6-4789-8abc-def012345678';
const contextWith = (id: string) => ({ params: Promise.resolve({ id }) });
const req = () => ({ nextUrl: new URL(`http://localhost/api/car-infos/${VALID_ID}`), json: vi.fn() }) as any;

describe('API Route - GET /api/car-infos/[id] (admin only)', () => {
  afterEach(() => vi.clearAllMocks());

  it.each([
    ['unauthenticated', null, 401],
    ['regular user', { user: regularUser }, 403],
  ])('returns %s -> %s', async (_name, session, status) => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(session as any);
    const response = await GET(req(), contextWith(VALID_ID));
    expect(response.status).toBe(status);
    expect(readCarInfo).not.toHaveBeenCalled();
  });

  it('returns 200 for admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    vi.mocked(readCarInfo).mockResolvedValueOnce({ id: VALID_ID } as any);
    const response = await GET(req(), contextWith(VALID_ID));
    expect(response.status).toBe(200);
    expect(readCarInfo).toHaveBeenCalledWith(VALID_ID);
  });
});

describe('API Route - PUT /api/car-infos/[id] (admin only)', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns 401 for unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = req();
    request.json.mockResolvedValue({ id: VALID_ID });
    const response = await PUT(request, contextWith(VALID_ID));
    expect(response.status).toBe(401);
    expect(updateCarInfo).not.toHaveBeenCalled();
  });

  it('returns 403 for regular user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: regularUser } as any);
    const request = req();
    request.json.mockResolvedValue({ id: VALID_ID });
    const response = await PUT(request, contextWith(VALID_ID));
    expect(response.status).toBe(403);
    expect(updateCarInfo).not.toHaveBeenCalled();
  });

  it('invokes updateCarInfo for admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    const request = req();
    request.json.mockResolvedValue({ id: VALID_ID });
    vi.mocked(updateCarInfo).mockResolvedValueOnce({ id: VALID_ID } as any);
    const response = await PUT(request, contextWith(VALID_ID));
    expect([200, 204]).toContain(response.status);
    expect(updateCarInfo).toHaveBeenCalledTimes(1);
  });
});

describe('API Route - DELETE /api/car-infos/[id] (admin only)', () => {
  afterEach(() => vi.clearAllMocks());

  it.each([
    ['unauthenticated', null, 401],
    ['regular user', { user: regularUser }, 403],
  ])('returns %s -> %s', async (_name, session, status) => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(session as any);
    const response = await DELETE(req(), contextWith(VALID_ID));
    expect(response.status).toBe(status);
    expect(deleteCarInfo).not.toHaveBeenCalled();
  });

  it('returns 204 for admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: adminUser } as any);
    vi.mocked(deleteCarInfo).mockResolvedValueOnce(undefined as any);
    const response = await DELETE(req(), contextWith(VALID_ID));
    expect(response.status).toBe(204);
    expect(deleteCarInfo).toHaveBeenCalledWith(VALID_ID);
  });
});
