import { AsyncLocalStorage } from 'async_hooks';
import type { McpAuthContext } from '@/mcp/auth-context';

const mcpAuthContextStorage = new AsyncLocalStorage<McpAuthContext | null>();

export const getMcpAuthContext = (): McpAuthContext | null => mcpAuthContextStorage.getStore() ?? null;

export const runWithMcpAuthContext = <T>(context: McpAuthContext | null, fn: () => T): T => mcpAuthContextStorage.run(context, fn);

export const mcpContextFromAuthExtra = (extra: unknown): McpAuthContext | null => {
  const authExtra = extra as { mcpContext?: McpAuthContext } | undefined;
  return authExtra?.mcpContext ?? null;
};
