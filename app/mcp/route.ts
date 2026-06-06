import { createMcpRouteHandlers } from '@/mcp/create-route';

export const runtime = 'nodejs';
export const maxDuration = 60;

const handlers = createMcpRouteHandlers();

export const GET = handlers.GET;
export const POST = handlers.POST;
export const DELETE = handlers.DELETE;
