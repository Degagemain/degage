import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { canUseMcpTools } from '@/mcp/auth-context';
import { mcpRoleScope } from '@/mcp/config';
import { getMcpAuthContext } from '@/mcp/request-context';
import { registerCreateSimulationPrompt } from '@/mcp/prompts/create-simulation';
import { registerCreateDocumentationGroupTool } from '@/mcp/tools/create-documentation-group';
import { registerCreateSimulationTool } from '@/mcp/tools/create-simulation';
import { registerReadCarBrandTool } from '@/mcp/tools/read-car-brand';
import { registerSearchCarBrandsTool } from '@/mcp/tools/search-car-brands';
import { registerSearchCarTypesTool } from '@/mcp/tools/search-car-types';
import { registerSearchDocumentationGroupsTool } from '@/mcp/tools/search-documentation-groups';
import { registerSearchFuelTypesTool } from '@/mcp/tools/search-fuel-types';
import { registerSearchTownsTool } from '@/mcp/tools/search-towns';
import { registerUpdateDocumentationGroupTool } from '@/mcp/tools/update-documentation-group';
import { registerUpdateDocumentationTool } from '@/mcp/tools/update-documentation';
import { registerSearchDocumentationTool } from '@/mcp/tools/search-documentation';

export const registerMcpTools = (server: McpServer): void => {
  const ctx = getMcpAuthContext();
  if (!ctx) return;

  const userScope = mcpRoleScope('user');
  const adminScope = mcpRoleScope('admin');

  if (canUseMcpTools(ctx, userScope).ok) {
    registerSearchDocumentationTool(server, getMcpAuthContext, userScope);
    registerSearchDocumentationGroupsTool(server, getMcpAuthContext, userScope);
    registerSearchFuelTypesTool(server, getMcpAuthContext, userScope);
    registerSearchCarBrandsTool(server, getMcpAuthContext, userScope);
    registerReadCarBrandTool(server, getMcpAuthContext, userScope);
    registerSearchCarTypesTool(server, getMcpAuthContext, userScope);
    registerSearchTownsTool(server, getMcpAuthContext, userScope);
    registerCreateSimulationTool(server, getMcpAuthContext, userScope);
    registerCreateSimulationPrompt(server);
  }

  if (canUseMcpTools(ctx, adminScope, true).ok) {
    registerUpdateDocumentationTool(server, getMcpAuthContext, adminScope);
    registerCreateDocumentationGroupTool(server, getMcpAuthContext, adminScope);
    registerUpdateDocumentationGroupTool(server, getMcpAuthContext, adminScope);
  }
};
