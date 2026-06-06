import { afterEach, describe, expect, it } from 'vitest';
import { mcpProtectedResourceMetadata } from '@/mcp/protected-resource-metadata';

describe('mcpProtectedResourceMetadata', () => {
  const originalAuthUrl = process.env.BETTER_AUTH_URL;

  afterEach(() => {
    process.env.BETTER_AUTH_URL = originalAuthUrl;
  });

  it('points to the MCP resource and Better Auth issuer', () => {
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';
    expect(mcpProtectedResourceMetadata()).toEqual({
      resource: 'http://localhost:3000/mcp',
      authorization_servers: ['http://localhost:3000/api/auth'],
    });
  });
});
