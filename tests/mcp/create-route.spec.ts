import { afterEach, describe, expect, it, vi } from 'vitest';

const createMcpHandler = vi.fn(() => vi.fn(async () => new Response('ok')));
const withMcpAuth = vi.fn((_handler: unknown, _verify: unknown) => vi.fn(async () => new Response('ok')));
const instrument = vi.fn();
const getPostHogClient = vi.fn(() => ({ flush: vi.fn() }));

vi.mock('mcp-handler', () => ({
  createMcpHandler,
  withMcpAuth,
}));

vi.mock('@posthog/mcp', () => ({
  instrument,
}));

vi.mock('@/integrations/posthog', () => ({
  isPostHogEnabled: true,
  getPostHogClient,
  flushPostHogEvents: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/mcp/verify-token', () => ({
  verifyMcpAccessToken: vi.fn(),
}));

vi.mock('@/mcp/tools/register-tools', () => ({
  registerMcpTools: vi.fn(),
}));

describe('createMcpRouteHandlers', () => {
  const originalMcpEnabled = process.env.MCP_ENABLED;

  afterEach(() => {
    process.env.MCP_ENABLED = originalMcpEnabled;
    vi.clearAllMocks();
  });

  it('configures streamableHttpEndpoint to match the route path', async () => {
    process.env.MCP_ENABLED = 'true';
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';

    const { createMcpRouteHandlers } = await import('@/mcp/create-route');
    createMcpRouteHandlers();

    expect(createMcpHandler).toHaveBeenCalledTimes(1);
    expect(createMcpHandler.mock.calls[0]?.[2]).toMatchObject({
      streamableHttpEndpoint: '/mcp',
      disableSse: true,
    });
  });

  it('instruments the MCP server with PostHog when enabled', async () => {
    process.env.MCP_ENABLED = 'true';
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';

    const { createMcpRouteHandlers } = await import('@/mcp/create-route');
    createMcpRouteHandlers();

    const setup = createMcpHandler.mock.calls[0]?.[0] as (server: unknown) => void;
    const server = { tool: vi.fn() };
    setup(server);

    expect(instrument).toHaveBeenCalledWith(server, expect.anything(), expect.objectContaining({ identify: expect.any(Function) }));
  });
});
