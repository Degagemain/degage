import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchDocumentation } from '@/actions/documentation/search';
import { documentationFilterSchema } from '@/domain/documentation.filter';
import { isAdmin } from '@/domain/role.utils';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationSearchMcpInputSchema } from '@/mcp/tools/documentation-input-schemas';

export const registerSearchDocumentationTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'search_documentation',
    {
      description:
        'Search and list documentation articles using the same filters as GET /api/documentation. ' +
        'Returns { records, total } with pagination (skip/take) and optional text query.',
      inputSchema: documentationSearchMcpInputSchema,
    },
    async (input) => {
      const ctx = getContext();
      if (!ctx) {
        return {
          content: [{ type: 'text' as const, text: 'Unauthorized' }],
          isError: true,
        };
      }

      const gate = canUseMcpTools(ctx, requiredScope);
      if (!gate.ok) {
        return {
          content: [{ type: 'text' as const, text: mcpToolGateErrorMessage(gate.reason) }],
          isError: true,
        };
      }

      const viewerIsAdmin = isAdmin({ id: ctx.userId, role: ctx.role, banned: ctx.banned });
      const filter = documentationFilterSchema.parse({
        ...input,
        ...(viewerIsAdmin ? {} : { isPublic: true }),
      });

      const result = await searchDocumentation(filter, {
        isViewerAdmin: viewerIsAdmin,
        isAuthenticated: true,
      });

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
