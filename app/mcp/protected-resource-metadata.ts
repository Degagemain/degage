import { betterAuthIssuer, mcpAudience } from '@/mcp/config';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=15, stale-while-revalidate=15, stale-if-error=86400',
} as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
} as const;

export const mcpProtectedResourceMetadata = (): { resource: string; authorization_servers: string[] } => ({
  resource: mcpAudience(),
  authorization_servers: [betterAuthIssuer()],
});

export const mcpProtectedResourceGetResponse = (): Response =>
  new Response(JSON.stringify(mcpProtectedResourceMetadata()), { headers: jsonHeaders });

export const mcpProtectedResourceOptionsResponse = (): Response => new Response(null, { status: 204, headers: corsHeaders });
