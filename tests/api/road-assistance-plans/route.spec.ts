import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/road-assistance-plan/search', () => ({
  searchRoadAssistancePlans: vi.fn(),
}));

vi.mock('@/actions/road-assistance-plan/create', () => ({
  createRoadAssistancePlan: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/road-assistance-plans/route';
import { auth } from '@/auth';
import { searchRoadAssistancePlans } from '@/actions/road-assistance-plan/search';
import { createRoadAssistancePlan } from '@/actions/road-assistance-plan/create';
import { roadAssistancePlan } from '../../builders/road-assistance-plan.builder';

describe('API Route - GET /api/road-assistance-plans', () => {
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

      const request = { nextUrl: new URL('http://localhost/api/road-assistance-plans') } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchRoadAssistancePlans).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = { nextUrl: new URL('http://localhost/api/road-assistance-plans') } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchRoadAssistancePlans).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      vi.mocked(searchRoadAssistancePlans).mockResolvedValueOnce({
        records: [roadAssistancePlan({ name: 'Basic' })],
        total: 1,
      });

      const request = { nextUrl: new URL('http://localhost/api/road-assistance-plans') } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchRoadAssistancePlans).toHaveBeenCalledTimes(1);
    });

    it('returns 200 when admin requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(searchRoadAssistancePlans).mockResolvedValueOnce({
        records: [roadAssistancePlan({ name: 'Premium' })],
        total: 1,
      });

      const request = { nextUrl: new URL('http://localhost/api/road-assistance-plans') } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchRoadAssistancePlans).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - POST /api/road-assistance-plans', () => {
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

  const validRoadAssistancePlanBody = {
    id: null,
    name: 'Basic',
    description: 'Basic road assistance coverage.',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Basic', description: 'Basic road assistance coverage.' },
      { locale: 'nl', name: 'Basis', description: 'Basis pechverhelpingsdekking.' },
      { locale: 'fr', name: 'Basique', description: "Couverture d'assistance routière de base." },
    ],
    createdAt: null,
    updatedAt: null,
  };

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {
        nextUrl: new URL('http://localhost/api/road-assistance-plans'),
        json: vi.fn().mockResolvedValue(validRoadAssistancePlanBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createRoadAssistancePlan).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/road-assistance-plans'),
        json: vi.fn().mockResolvedValue(validRoadAssistancePlanBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createRoadAssistancePlan).not.toHaveBeenCalled();
    });
  });

  describe('authorization - POST admin only', () => {
    it('returns 403 when regular user attempts to create', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/road-assistance-plans'),
        json: vi.fn().mockResolvedValue(validRoadAssistancePlanBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Access denied');
      expect(createRoadAssistancePlan).not.toHaveBeenCalled();
    });

    it('returns 201 when admin creates road assistance plan', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const created = roadAssistancePlan({ id: 'new-id', name: 'Basic' });
      vi.mocked(createRoadAssistancePlan).mockResolvedValueOnce(created);

      const request = {
        nextUrl: new URL('http://localhost/api/road-assistance-plans'),
        json: vi.fn().mockResolvedValue(validRoadAssistancePlanBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.name).toBe('Basic');
      expect(createRoadAssistancePlan).toHaveBeenCalledTimes(1);
    });
  });
});
