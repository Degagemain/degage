import { afterEach, describe, expect, it, vi } from 'vitest';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Role } from '@/domain/role.model';
import type { McpAuthContext } from '@/mcp/auth-context';
import { documentation } from '../../builders/documentation.builder';

vi.mock('@/actions/documentation/create', () => ({
  createDocumentation: vi.fn(),
}));

vi.mock('@/actions/documentation/embed', () => ({
  embedDocumentationById: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    exception: vi.fn(),
  },
}));

import { createDocumentation } from '@/actions/documentation/create';
import { embedDocumentationById } from '@/actions/documentation/embed';
import { logger } from '@/lib/logger';
import { registerCreateDocumentationTool } from '@/mcp/tools/create-documentation';

type ToolResult = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type ToolHandler = (input: unknown) => Promise<ToolResult>;

const adminContext: McpAuthContext = {
  userId: 'admin-1',
  role: Role.ADMIN,
  emailVerified: true,
  banned: false,
  scopes: ['mcp:admin'],
  clientId: 'client-1',
};

const createInput = () => {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...body
  } = documentation({
    id: null,
    externalId: '',
  });
  return body;
};

const registerAndGetHandler = (getContext: () => McpAuthContext | null): ToolHandler => {
  const registerTool = vi.fn();
  const server = { registerTool } as unknown as McpServer;
  registerCreateDocumentationTool(server, getContext, 'mcp:admin');
  expect(registerTool).toHaveBeenCalledWith('create_documentation', expect.any(Object), expect.any(Function));
  return registerTool.mock.calls[0]![2] as ToolHandler;
};

describe('create_documentation tool', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when there is no auth context', async () => {
    const handler = registerAndGetHandler(() => null);
    const result = await handler(createInput());
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe('Unauthorized');
    expect(createDocumentation).not.toHaveBeenCalled();
  });

  it('rejects non-admin callers', async () => {
    const handler = registerAndGetHandler(() => ({
      ...adminContext,
      role: Role.USER,
      scopes: ['mcp:admin'],
    }));
    const result = await handler(createInput());
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('Admin role');
    expect(createDocumentation).not.toHaveBeenCalled();
  });

  it('creates the article and generates embeddings', async () => {
    const saved = documentation({ id: '550e8400-e29b-41d4-a716-446655440000', externalId: 'manual:abc' });
    vi.mocked(createDocumentation).mockResolvedValueOnce(saved);
    vi.mocked(embedDocumentationById).mockResolvedValueOnce();

    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler(createInput());

    expect(result.isError).toBeUndefined();
    expect(createDocumentation).toHaveBeenCalledTimes(1);
    expect(embedDocumentationById).toHaveBeenCalledWith(saved.id);
    expect(result.content).toHaveLength(1);
    expect(JSON.parse(result.content[0]!.text)).toEqual({
      ...saved,
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    });
  });

  it('returns the created article without isError when embeddings fail', async () => {
    const saved = documentation({ id: '550e8400-e29b-41d4-a716-446655440000', externalId: 'manual:abc' });
    vi.mocked(createDocumentation).mockResolvedValueOnce(saved);
    vi.mocked(embedDocumentationById).mockRejectedValueOnce(new Error('gemini down'));

    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler(createInput());

    expect(result.isError).toBeUndefined();
    expect(createDocumentation).toHaveBeenCalledTimes(1);
    expect(embedDocumentationById).toHaveBeenCalledWith(saved.id);
    expect(logger.exception).toHaveBeenCalled();
    expect(JSON.parse(result.content[0]!.text).id).toBe(saved.id);
    expect(result.content[1]?.text).toContain('Do not create it again');
    expect(result.content[1]?.text).toContain(saved.id);
  });

  it('returns isError when create fails', async () => {
    vi.mocked(createDocumentation).mockRejectedValueOnce(new Error('db unique constraint'));

    const handler = registerAndGetHandler(() => adminContext);
    const result = await handler(createInput());

    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toBe('db unique constraint');
    expect(embedDocumentationById).not.toHaveBeenCalled();
  });
});
