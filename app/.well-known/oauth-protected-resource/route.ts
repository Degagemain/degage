import { isMcpEnabled } from '@/mcp/config';
import { mcpProtectedResourceGetResponse, mcpProtectedResourceOptionsResponse } from '@/mcp/protected-resource-metadata';

const disabledResponse = (): Response => new Response(null, { status: 404 });

export const GET = async (): Promise<Response> => (isMcpEnabled() ? mcpProtectedResourceGetResponse() : disabledResponse());

export const OPTIONS = async (): Promise<Response> => (isMcpEnabled() ? mcpProtectedResourceOptionsResponse() : disabledResponse());
