import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchDocumentationGroups } from '@/actions/documentation-group/search';
import { documentationGroupFilterSchema } from '@/domain/documentation-group.filter';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationGroupSearchMcpInputSchema } from '@/mcp/tools/documentation-group-input-schemas';

export const registerSearchDocumentationGroupsTool = (
  server: McpServer,
  getContext: () => McpAuthContext | null,
  requiredScope: string,
): void => {
  server.registerTool(
    'search_documentation_groups',
    {
      description:
        'List and search documentation groups used to label and organise help articles. ' +
        'Returns { records, total } with pagination and optional text query on group names.',
      inputSchema: documentationGroupSearchMcpInputSchema,
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

      const filter = documentationGroupFilterSchema.parse(input);

      const result = await withRequestContext(
        {
          locale: defaultUILocale,
          contentLocale: getContentLocale(defaultUILocale),
          userId: ctx.userId,
        },
        () => searchDocumentationGroups(filter),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
