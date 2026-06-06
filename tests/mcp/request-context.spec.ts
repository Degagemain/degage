import { describe, expect, it } from 'vitest';
import { Role } from '@/domain/role.model';
import { getMcpAuthContext, mcpContextFromAuthExtra, runWithMcpAuthContext } from '@/mcp/request-context';

describe('mcp request context', () => {
  it('returns null outside runWithMcpAuthContext', () => {
    expect(getMcpAuthContext()).toBeNull();
  });

  it('stores context for the synchronous callback', () => {
    const ctx = {
      userId: 'user-1',
      role: Role.USER,
      emailVerified: true,
      banned: false,
      scopes: ['mcp:user'],
      clientId: 'client-1',
    };

    runWithMcpAuthContext(ctx, () => {
      expect(getMcpAuthContext()).toEqual(ctx);
    });
  });

  it('propagates context through awaited work started inside runWithMcpAuthContext', async () => {
    const ctx = {
      userId: 'user-1',
      role: Role.USER,
      emailVerified: true,
      banned: false,
      scopes: ['mcp:user'],
      clientId: 'client-1',
    };

    await runWithMcpAuthContext(ctx, async () => {
      await Promise.resolve();
      expect(getMcpAuthContext()).toEqual(ctx);
    });
  });

  it('extracts mcpContext from auth extra', () => {
    const ctx = {
      userId: 'user-1',
      role: Role.USER,
      emailVerified: true,
      banned: false,
      scopes: ['mcp:user'],
      clientId: 'client-1',
    };

    expect(mcpContextFromAuthExtra({ mcpContext: ctx })).toEqual(ctx);
    expect(mcpContextFromAuthExtra({})).toBeNull();
    expect(mcpContextFromAuthExtra(undefined)).toBeNull();
  });
});
