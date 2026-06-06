import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { canUseMcpTools } from '@/mcp/auth-context';
import { mcpRoleScope } from '@/mcp/config';
import { getMcpAuthContext } from '@/mcp/request-context';
import { registerUpdateDocumentationTool } from '@/mcp/tools/update-documentation';
import { registerSearchDocumentationTool } from '@/mcp/tools/search-documentation';

export const registerMcpTools = (server: McpServer): void => {
  const ctx = getMcpAuthContext();
  if (!ctx) return;

  const userScope = mcpRoleScope('user');
  const adminScope = mcpRoleScope('admin');

  if (canUseMcpTools(ctx, userScope).ok) {
    registerSearchDocumentationTool(server, getMcpAuthContext, userScope);
  }

  if (canUseMcpTools(ctx, adminScope, true).ok) {
    registerUpdateDocumentationTool(server, getMcpAuthContext, adminScope);
  }
};
