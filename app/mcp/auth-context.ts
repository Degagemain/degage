import { APIError } from 'better-auth/api';
import { Role, type Role as RoleType } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { getPrismaClient } from '@/storage/utils';

export type McpAuthContext = {
  userId: string;
  role: RoleType;
  emailVerified: boolean;
  banned: boolean;
  scopes: string[];
  clientId: string;
};

export type McpToolGateResult = { ok: true } | { ok: false; reason: 'banned' | 'unverified' | 'forbidden_scope' | 'forbidden_role' };

export const parseScopes = (scopes: string | string[] | undefined): string[] => {
  if (!scopes) return [];
  if (Array.isArray(scopes)) return scopes;
  return scopes.split(/\s+/).filter(Boolean);
};

export const canUseMcpTools = (ctx: McpAuthContext, requiredScope: string, requireAdminRole = false): McpToolGateResult => {
  if (ctx.banned) return { ok: false, reason: 'banned' };
  if (!ctx.emailVerified) return { ok: false, reason: 'unverified' };
  if (!ctx.scopes.includes(requiredScope)) return { ok: false, reason: 'forbidden_scope' };
  if (requireAdminRole && !isAdmin({ id: ctx.userId, role: ctx.role, banned: ctx.banned })) {
    return { ok: false, reason: 'forbidden_role' };
  }
  return { ok: true };
};

export const mcpToolGateErrorMessage = (reason: Exclude<McpToolGateResult, { ok: true }>['reason']): string => {
  switch (reason) {
    case 'banned':
      return 'Your account is banned.';
    case 'unverified':
      return 'Verify your email before using MCP tools.';
    case 'forbidden_scope':
      return 'This token does not include the required MCP scope.';
    case 'forbidden_role':
      return 'Admin role is required for this tool.';
    default:
      return 'Access denied.';
  }
};

export const assertUserCanReceiveOAuthToken = async (userId: string): Promise<void> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { banned: true },
  });

  if (user?.banned) {
    throw new APIError('FORBIDDEN', { message: 'Account banned' });
  }
};

export const loadMcpAuthContext = async (params: {
  userId: string;
  scopes: string | string[] | undefined;
  clientId?: string;
}): Promise<McpAuthContext | null> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      role: true,
      emailVerified: true,
      banned: true,
    },
  });

  if (!user) return null;

  const role = (user.role === Role.ADMIN ? Role.ADMIN : Role.USER) as RoleType;

  return {
    userId: user.id,
    role,
    emailVerified: user.emailVerified,
    banned: user.banned ?? false,
    scopes: parseScopes(params.scopes),
    clientId: params.clientId ?? '',
  };
};
