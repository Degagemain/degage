import { type IncomingMessage, type Server, type ServerResponse, createServer } from 'node:http';
import { createConnection } from 'node:net';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  PLAY_MOCK_SESSION_COOKIE_NAME,
  PLAY_MOCK_SESSION_COOKIE_VALUE,
  credentialsMatchPlayMock,
  getPlayMockBaseUrl,
  getPlayMockPort,
  isValidPlayMockSessionCookie,
} from './credentials';

const INFOSSESSION_HTML = readFileSync(join(process.cwd(), 'e2e/play-mock/pages/infosession.html'), 'utf8');

const serverReadyTimeoutMs = 30_000;

const readRequestBody = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });

const waitForPort = (port: number, timeoutMs = serverReadyTimeoutMs): Promise<void> => {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = createConnection({ port, host: '127.0.0.1' });
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for play mock server on port ${port}`));
          return;
        }
        setTimeout(tryConnect, 100);
      });
    };
    tryConnect();
  });
};

const sendText = (response: ServerResponse, status: number, body: string): void => {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(body);
};

const handleLogin = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const body = await readRequestBody(request);
  const params = new URLSearchParams(body);
  const email = params.get('email') ?? '';
  const password = params.get('password') ?? '';

  if (!credentialsMatchPlayMock(email, password)) {
    sendText(response, 401, 'Invalid credentials');
    return;
  }

  response.writeHead(302, {
    Location: '/infosession',
    'Set-Cookie': [
      `${PLAY_MOCK_SESSION_COOKIE_NAME}=${PLAY_MOCK_SESSION_COOKIE_VALUE}; Path=/; HttpOnly; Max-Age=3600`,
      'JSESSIONID=mock-jsession; Path=/; Max-Age=3600',
    ],
  });
  response.end();
};

const handleInfosession = (request: IncomingMessage, response: ServerResponse): void => {
  if (!isValidPlayMockSessionCookie(request.headers.cookie)) {
    sendText(response, 401, 'Unauthorized');
    return;
  }

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(INFOSSESSION_HTML);
};

const handleRequest = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
  const url = new URL(request.url ?? '/', getPlayMockBaseUrl());
  const { pathname } = url;
  const method = request.method ?? 'GET';

  try {
    if (method === 'GET' && pathname === '/') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (method === 'POST' && pathname === '/login') {
      await handleLogin(request, response);
      return;
    }

    if (method === 'GET' && pathname === '/infosession') {
      handleInfosession(request, response);
      return;
    }

    sendText(response, 404, 'Not found');
  } catch {
    sendText(response, 500, 'Internal server error');
  }
};

export type PlayMockServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

export const startPlayMockServer = async (): Promise<PlayMockServer> => {
  const port = getPlayMockPort();
  const baseUrl = getPlayMockBaseUrl();

  const server: Server = createServer((request, response) => {
    void handleRequest(request, response);
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });

  await waitForPort(port);

  return {
    baseUrl,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
};

const isCliEntry = process.argv[1]?.replace(/\\/g, '/').endsWith('e2e/play-mock/server.ts');

if (isCliEntry) {
  void (async () => {
    const { loadE2eEnvIntoProcess } = await import('../shared/load-e2e-env');
    loadE2eEnvIntoProcess();
    const { baseUrl } = await startPlayMockServer();
    console.log(`Play connector mock listening on ${baseUrl}`);
  })();
}
