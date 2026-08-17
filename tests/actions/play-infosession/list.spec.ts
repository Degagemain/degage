import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/play-connector/get-session-cookie', () => ({
  getPlaySessionCookie: vi.fn(),
}));

vi.mock('@/play-connector/client', () => ({
  fetchPlay: vi.fn(),
}));

import { isOwnerInfosessionType, listPlayInfosessions } from '@/actions/play-infosession/list';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';

const tableHtml = readFileSync(join(process.cwd(), 'tests/fixtures/play-connector/infosession-table.html'), 'utf8');
const enrolledHtml = readFileSync(join(process.cwd(), 'tests/fixtures/play-connector/infosession-enrolled.html'), 'utf8');

describe('isOwnerInfosessionType', () => {
  it('matches Play owner session types', () => {
    expect(isOwnerInfosessionType('Voor Auto-eigenaar')).toBe(true);
    expect(isOwnerInfosessionType('Auto-eigenaar')).toBe(true);
    expect(isOwnerInfosessionType('VOOR AUTO-EIGENAAR')).toBe(true);
  });

  it('rejects borrower and empty types', () => {
    expect(isOwnerInfosessionType('Voor Leners van auto of fiets')).toBe(false);
    expect(isOwnerInfosessionType('')).toBe(false);
  });
});

describe('listPlayInfosessions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns only owner infosessions from the upcoming table', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'session=abc', expiresAt: new Date() });
    vi.mocked(fetchPlay).mockResolvedValueOnce({ html: tableHtml, status: 200 });

    const result = await listPlayInfosessions('user-1');

    expect(getPlaySessionCookie).toHaveBeenCalledWith('user-1');
    expect(fetchPlay).toHaveBeenCalledWith('/infosession', 'session=abc');
    expect(result.chosenInfosession).toBeNull();
    expect(result.infosessions).toHaveLength(8);
    expect(result.infosessions.every((row) => isOwnerInfosessionType(row.type))).toBe(true);
    expect(result.infosessions.map((row) => row.enrollId)).toEqual(['1383', '1349', '1338', '1384', '1389', '1385', '1340', '1342']);
  });

  it('keeps the chosen session even when listing owner rows', async () => {
    vi.mocked(getPlaySessionCookie).mockResolvedValueOnce({ cookieHeader: 'session=abc', expiresAt: new Date() });
    vi.mocked(fetchPlay).mockResolvedValueOnce({ html: enrolledHtml, status: 200 });

    const result = await listPlayInfosessions('user-1');

    expect(result.chosenInfosession).toMatchObject({
      type: 'Auto-eigenaar',
      host: 'Host Chosen',
    });
    expect(result.infosessions.every((row) => isOwnerInfosessionType(row.type))).toBe(true);
  });
});
