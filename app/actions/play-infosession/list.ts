import type { PlayInfosession } from '@/domain/play-infosession.model';
import { playInfosessionSchema } from '@/domain/play-infosession.model';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';
import { parseInfosessionTable } from '@/play-connector/parsers/infosession-table.parser';

export const listPlayInfosessions = async (userId: string): Promise<PlayInfosession[]> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  const { html } = await fetchPlay('/infosession', cookieHeader);
  const rows = parseInfosessionTable(html);

  return rows.map((row) => playInfosessionSchema.parse(row));
};
