import { afterEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@/domain/role.model';
import type { McpAuthContext } from '@/mcp/auth-context';

const {
  registerSearchDocumentationTool,
  registerUpdateDocumentationTool,
  registerSearchDocumentationGroupsTool,
  registerSearchFuelTypesTool,
  registerCreateDocumentationGroupTool,
  registerUpdateDocumentationGroupTool,
} = vi.hoisted(() => ({
  registerSearchDocumentationTool: vi.fn(),
  registerUpdateDocumentationTool: vi.fn(),
  registerSearchDocumentationGroupsTool: vi.fn(),
  registerSearchFuelTypesTool: vi.fn(),
  registerCreateDocumentationGroupTool: vi.fn(),
  registerUpdateDocumentationGroupTool: vi.fn(),
}));

vi.mock('@/mcp/tools/search-documentation', () => ({
  registerSearchDocumentationTool,
}));

vi.mock('@/mcp/tools/update-documentation', () => ({
  registerUpdateDocumentationTool,
}));

vi.mock('@/mcp/tools/search-documentation-groups', () => ({
  registerSearchDocumentationGroupsTool,
}));

vi.mock('@/mcp/tools/search-fuel-types', () => ({
  registerSearchFuelTypesTool,
}));

vi.mock('@/mcp/tools/create-documentation-group', () => ({
  registerCreateDocumentationGroupTool,
}));

vi.mock('@/mcp/tools/update-documentation-group', () => ({
  registerUpdateDocumentationGroupTool,
}));

import { runWithMcpAuthContext } from '@/mcp/request-context';
import { registerMcpTools } from '@/mcp/tools/register-tools';

const server = {} as Parameters<typeof registerMcpTools>[0];

const baseContext: McpAuthContext = {
  userId: 'user-1',
  role: Role.USER,
  emailVerified: true,
  banned: false,
  scopes: ['mcp:user'],
  clientId: 'client-1',
};

describe('registerMcpTools', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers no tools without auth context', () => {
    registerMcpTools(server);
    expect(registerSearchDocumentationTool).not.toHaveBeenCalled();
    expect(registerSearchDocumentationGroupsTool).not.toHaveBeenCalled();
    expect(registerSearchFuelTypesTool).not.toHaveBeenCalled();
    expect(registerUpdateDocumentationTool).not.toHaveBeenCalled();
    expect(registerCreateDocumentationGroupTool).not.toHaveBeenCalled();
    expect(registerUpdateDocumentationGroupTool).not.toHaveBeenCalled();
  });

  it('registers only search tools for a verified user with mcp:user scope', () => {
    runWithMcpAuthContext(baseContext, () => registerMcpTools(server));

    expect(registerSearchDocumentationTool).toHaveBeenCalledTimes(1);
    expect(registerSearchDocumentationGroupsTool).toHaveBeenCalledTimes(1);
    expect(registerSearchFuelTypesTool).toHaveBeenCalledTimes(1);
    expect(registerUpdateDocumentationTool).not.toHaveBeenCalled();
    expect(registerCreateDocumentationGroupTool).not.toHaveBeenCalled();
    expect(registerUpdateDocumentationGroupTool).not.toHaveBeenCalled();
  });

  it('registers all tools for a verified admin with both scopes', () => {
    runWithMcpAuthContext(
      {
        ...baseContext,
        role: Role.ADMIN,
        scopes: ['mcp:user', 'mcp:admin'],
      },
      () => registerMcpTools(server),
    );

    expect(registerSearchDocumentationTool).toHaveBeenCalledTimes(1);
    expect(registerSearchDocumentationGroupsTool).toHaveBeenCalledTimes(1);
    expect(registerSearchFuelTypesTool).toHaveBeenCalledTimes(1);
    expect(registerUpdateDocumentationTool).toHaveBeenCalledTimes(1);
    expect(registerCreateDocumentationGroupTool).toHaveBeenCalledTimes(1);
    expect(registerUpdateDocumentationGroupTool).toHaveBeenCalledTimes(1);
  });

  it('registers no tools when email is unverified', () => {
    runWithMcpAuthContext({ ...baseContext, emailVerified: false }, () => registerMcpTools(server));

    expect(registerSearchDocumentationTool).not.toHaveBeenCalled();
    expect(registerSearchDocumentationGroupsTool).not.toHaveBeenCalled();
    expect(registerSearchFuelTypesTool).not.toHaveBeenCalled();
    expect(registerUpdateDocumentationTool).not.toHaveBeenCalled();
    expect(registerCreateDocumentationGroupTool).not.toHaveBeenCalled();
    expect(registerUpdateDocumentationGroupTool).not.toHaveBeenCalled();
  });

  it('does not register admin tools when admin scope is missing', () => {
    runWithMcpAuthContext(
      {
        ...baseContext,
        role: Role.ADMIN,
        scopes: ['mcp:user'],
      },
      () => registerMcpTools(server),
    );

    expect(registerSearchDocumentationTool).toHaveBeenCalledTimes(1);
    expect(registerSearchDocumentationGroupsTool).toHaveBeenCalledTimes(1);
    expect(registerSearchFuelTypesTool).toHaveBeenCalledTimes(1);
    expect(registerUpdateDocumentationTool).not.toHaveBeenCalled();
    expect(registerCreateDocumentationGroupTool).not.toHaveBeenCalled();
    expect(registerUpdateDocumentationGroupTool).not.toHaveBeenCalled();
  });
});
