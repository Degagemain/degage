import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createDocumentationGroup } from '@/actions/documentation-group/create';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { documentationGroupCreateBodySchema, documentationGroupCreateMcpInputSchema } from '@/mcp/tools/documentation-group-input-schemas';

export const registerCreateDocumentationGroupTool = (
  server: McpServer,
  getContext: () => McpAuthContext | null,
  requiredScope: string,
): void => {
  server.registerTool(
    'create_documentation_group',
    {
      description: 'Create a documentation group. Send sort order, display name, and a translation per locale (en, nl, fr).',
      inputSchema: documentationGroupCreateMcpInputSchema,
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
        const group = documentationGroupCreateBodySchema.parse(input);
        const created = await withRequestContext(
          {
            locale: defaultUILocale,
            contentLocale: getContentLocale(defaultUILocale),
            userId: ctx.userId,
          },
          () => createDocumentationGroup(group),
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(created, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create documentation group';
        return {
          content: [{ type: 'text' as const, text: message }],
          isError: true,
        };
      }
    },
  );
};
