import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/road-assistance-plan/read', () => ({
  readRoadAssistancePlan: vi.fn(),
}));

vi.mock('@/actions/road-assistance-plan/update', () => ({
  updateRoadAssistancePlan: vi.fn(),
}));

vi.mock('@/actions/road-assistance-plan/delete', () => ({
  deleteRoadAssistancePlan: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/road-assistance-plans/[id]/route';
import { auth } from '@/auth';
import { readRoadAssistancePlan } from '@/actions/road-assistance-plan/read';
import { updateRoadAssistancePlan } from '@/actions/road-assistance-plan/update';
import { deleteRoadAssistancePlan } from '@/actions/road-assistance-plan/delete';
import { roadAssistancePlan } from '../../../builders/road-assistance-plan.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('API Route - GET /api/road-assistance-plans/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readRoadAssistancePlan).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readRoadAssistancePlan).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      const mockPlan = roadAssistancePlan({ id: validId, name: 'Basic' });
      vi.mocked(readRoadAssistancePlan).mockResolvedValueOnce(mockPlan);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe(validId);
      expect(json.name).toBe('Basic');
      expect(readRoadAssistancePlan).toHaveBeenCalledWith(validId);
    });

    it('returns 200 when admin requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const mockPlan = roadAssistancePlan({ id: validId, name: 'Premium' });
      vi.mocked(readRoadAssistancePlan).mockResolvedValueOnce(mockPlan);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);

      expect(response.status).toBe(200);
      expect(readRoadAssistancePlan).toHaveBeenCalledWith(validId);
    });
  });
});

describe('API Route - PUT /api/road-assistance-plans/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

  const updateBody = {
    id: validId,
    name: 'Basic',
    description: 'Basic road assistance coverage.',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Basic', description: 'Basic road assistance coverage.' },
      { locale: 'nl', name: 'Basis', description: 'Basis pechverhelpingsdekking.' },
      { locale: 'fr', name: 'Basique', description: "Couverture d'assistance routière de base." },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('authorization - PUT admin only', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(updateRoadAssistancePlan).not.toHaveBeenCalled();
    });

    it('returns 403 when regular user attempts to update', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Access denied');
      expect(updateRoadAssistancePlan).not.toHaveBeenCalled();
    });

    it('returns 204 when admin updates', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(updateRoadAssistancePlan).mockResolvedValueOnce(roadAssistancePlan(updateBody));

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);

      expect(response.status).toBe(204);
      expect(updateRoadAssistancePlan).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - DELETE /api/road-assistance-plans/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

  describe('authorization - DELETE admin only', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(deleteRoadAssistancePlan).not.toHaveBeenCalled();
    });

    it('returns 403 when regular user attempts to delete', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Access denied');
      expect(deleteRoadAssistancePlan).not.toHaveBeenCalled();
    });

    it('returns 204 when admin deletes', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(deleteRoadAssistancePlan).mockResolvedValueOnce(undefined);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);

      expect(response.status).toBe(204);
      expect(deleteRoadAssistancePlan).toHaveBeenCalledWith(validId);
    });
  });
});
