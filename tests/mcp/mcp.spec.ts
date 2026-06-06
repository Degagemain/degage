import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/mcp/create-route', () => ({
  createMcpRouteHandlers: vi.fn(() => ({
    GET: vi.fn(async () => new Response(null, { status: 404 })),
    POST: vi.fn(async () => new Response(null, { status: 404 })),
    DELETE: vi.fn(async () => new Response(null, { status: 404 })),
  })),
}));

describe('mcp route', () => {
  const originalMcpEnabled = process.env.MCP_ENABLED;

  afterEach(() => {
    process.env.MCP_ENABLED = originalMcpEnabled;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('exports handlers from createMcpRouteHandlers', async () => {
    process.env.MCP_ENABLED = 'false';
    const { GET } = await import('@/mcp/route');
    const response = await GET(new Request('http://localhost/mcp'));
    expect(response.status).toBe(404);
  });
});
