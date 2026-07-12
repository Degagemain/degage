import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchCarBrands } from '@/actions/car-brand/search';
import { carBrandFilterSchema } from '@/domain/car-brand.filter';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { carBrandSearchMcpInputSchema } from '@/mcp/tools/car-brand-input-schemas';

export const registerSearchCarBrandsTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'search_car_brands',
    {
      description:
        'List and search car brands with code, active status, and locale names. ' +
        'Returns { records, total } with pagination and optional text query on names.',
      inputSchema: carBrandSearchMcpInputSchema,
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

      const filter = carBrandFilterSchema.parse(input);

      const result = await withRequestContext(
        {
          locale: defaultUILocale,
          contentLocale: getContentLocale(defaultUILocale),
          userId: ctx.userId,
        },
        () => searchCarBrands(filter),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
