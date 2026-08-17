import type { PlayInfosession } from '@/domain/play-infosession.model';
import { playInfosessionSchema } from '@/domain/play-infosession.model';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';
import { parseChosenInfosession } from '@/play-connector/parsers/infosession-chosen.parser';
import { parseInfosessionTable } from '@/play-connector/parsers/infosession-table.parser';

export type PlayInfosessionList = {
  infosessions: PlayInfosession[];
  chosenInfosession: PlayInfosession | null;
};

const OWNER_INFOSESSION_TYPE_KEYWORD = 'eigenaar';

export const isOwnerInfosessionType = (type: string): boolean => type.toLowerCase().includes(OWNER_INFOSESSION_TYPE_KEYWORD);

export const listPlayInfosessions = async (userId: string): Promise<PlayInfosessionList> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  const { html } = await fetchPlay('/infosession', cookieHeader);
  const rows = parseInfosessionTable(html).filter((row) => isOwnerInfosessionType(row.type));
  const chosenRow = parseChosenInfosession(html);

  return {
    infosessions: rows.map((row) => playInfosessionSchema.parse(row)),
    chosenInfosession: chosenRow ? playInfosessionSchema.parse(chosenRow) : null,
  };
};
