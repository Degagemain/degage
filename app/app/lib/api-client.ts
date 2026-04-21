const jsonRequest = (method: 'POST' | 'PUT' | 'PATCH', url: string, body?: unknown, init?: RequestInit): Promise<Response> =>
  fetch(url, {
    ...init,
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } : init?.headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const apiPost = (url: string, body?: unknown, init?: RequestInit): Promise<Response> => jsonRequest('POST', url, body, init);

export const apiPut = (url: string, body?: unknown, init?: RequestInit): Promise<Response> => jsonRequest('PUT', url, body, init);

export const apiPatch = (url: string, body?: unknown, init?: RequestInit): Promise<Response> => jsonRequest('PATCH', url, body, init);

export const apiDelete = (url: string, init?: RequestInit): Promise<Response> => fetch(url, { ...init, method: 'DELETE' });
