import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchCarTypes } from '@/actions/car-type/search';
import { withRequestContext } from '@/context/request-context';
import { defaultUILocale, getContentLocale } from '@/i18n/locales';
import { type McpAuthContext, canUseMcpTools, mcpToolGateErrorMessage } from '@/mcp/auth-context';
import { carTypeMcpFilterSchema, carTypeSearchMcpInputSchema } from '@/mcp/tools/car-type-input-schemas';

export const registerSearchCarTypesTool = (server: McpServer, getContext: () => McpAuthContext | null, requiredScope: string): void => {
  server.registerTool(
    'search_car_types',
    {
      description:
        'List and search car types for a given car brand and fuel type. ' +
        'brandId and fuelTypeId are required — use search_car_brands and search_fuel_types first. ' +
        'Returns { records, total } with pagination and optional text query on names.',
      inputSchema: carTypeSearchMcpInputSchema,
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

      const filter = carTypeMcpFilterSchema.parse(input);

      const result = await withRequestContext(
        {
          locale: defaultUILocale,
          contentLocale: getContentLocale(defaultUILocale),
          userId: ctx.userId,
        },
        () => searchCarTypes(filter),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );
};
