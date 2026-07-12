import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readCarBrand } from '@/actions/car-brand/read';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { carBrandReadMcpInputSchema } from '@/mcp/tools/car-brand-input-schemas';

export const registerReadCarBrandTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'read_car_brand',
    {
      description: 'Read a single car brand by UUID, including code, active status, and all locale names.',
      inputSchema: carBrandReadMcpInputSchema,
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

      try {
        const brand = await withRequestContext(
          {
            locale: defaultUILocale,
            contentLocale: getContentLocale(defaultUILocale),
            userId: ctx.userId,
          },
          () => readCarBrand(input.id),
        );

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(brand, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to read car brand';
        return {
          content: [{ type: 'text' as const, text: message }],
          isError: true,
        };
      }
    },
  );
};
