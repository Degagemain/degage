import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { updateDocumentationGroup } from '@/actions/documentation-group/update';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationGroupUpdateBodySchema, documentationGroupUpdateMcpInputSchema } from '@/mcp/tools/documentation-group-input-schemas';

export const registerUpdateDocumentationGroupTool = (
  server: McpServer,
  getContext: () => McpAuthContext | null,
  requiredScope: string,
): void => {
  server.registerTool(
    'update_documentation_group',
    {
      description:
        'Replace a documentation group. Use search_documentation_groups to load the current record, ' +
        'change the desired fields, then send the complete object including all translations. ' +
        'This is a full replace, not a partial update.',
      inputSchema: documentationGroupUpdateMcpInputSchema,
    },
    async (input) => {
      const ctx = getContext();
      if (!ctx) {
        return {
          content: [{ type: 'text' as const, text: 'Unauthorized' }],
          isError: true,
        };
      }

      const gate = canUseMcpTools(ctx, requiredScope, true);
      if (!gate.ok) {
        return {
          content: [{ type: 'text' as const, text: mcpToolGateErrorMessage(gate.reason) }],
          isError: true,
        };
      }

      try {
        const group = documentationGroupUpdateBodySchema.parse(input);
        const updated = await withRequestContext(
          {
            locale: defaultUILocale,
            contentLocale: getContentLocale(defaultUILocale),
            userId: ctx.userId,
          },
          () => updateDocumentationGroup(group),
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(updated, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update documentation group';
        return {
          content: [{ type: 'text' as const, text: message }],
          isError: true,
        };
      }
    },
  );
};
