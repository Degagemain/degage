import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { verifyMcpAccessToken } from '@/mcp/verify-token';
import { betterAuthBaseUrl, isMcpEnabled, mcpAudience, mcpPath, mcpResourceMetadataPath, mcpServerName } from '@/mcp/config';
import { mcpContextFromAuthExtra, runWithMcpAuthContext } from '@/mcp/request-context';
import { registerMcpTools } from '@/mcp/tools/register-tools';

type RouteHandlers = {
  GET: (req: Request) => Promise<Response>;
  POST: (req: Request) => Promise<Response>;
  DELETE: (req: Request) => Promise<Response>;
};

const disabledResponse = (): Response => new Response(null, { status: 404 });

export const createMcpRouteHandlers = (): RouteHandlers => {
  if (!isMcpEnabled()) {
    return {
      GET: async () => disabledResponse(),
      POST: async () => disabledResponse(),
      DELETE: async () => disabledResponse(),
    };
  }

  const baseHandler = createMcpHandler(
    (server: McpServer) => {
      registerMcpTools(server);
    },
    {
      serverInfo: {
        name: mcpServerName,
        version: '1.0.0',
      },
    },
    {
      maxDuration: 60,
      disableSse: true,
      streamableHttpEndpoint: mcpPath,
    },
  );

  const handler = withMcpAuth(
    (req: Request) => {
      const context = mcpContextFromAuthExtra(req.auth?.extra);
      return runWithMcpAuthContext(context, () => baseHandler(req));
    },
    (_req, bearerToken) => verifyMcpAccessToken(bearerToken, mcpAudience()),
    {
      required: true,
      resourceMetadataPath: mcpResourceMetadataPath,
      resourceUrl: betterAuthBaseUrl(),
    },
  );

  return {
    GET: handler,
    POST: handler,
    DELETE: handler,
  };
};
