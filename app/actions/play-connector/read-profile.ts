import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';
import { type PlayProfileBasicInfo, parsePlayProfileBasicInfo } from '@/play-connector/parsers/profile-page.parser';

export const readPlayProfile = async (userId: string): Promise<PlayProfileBasicInfo | null> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  const { html } = await fetchPlay('/profile', cookieHeader);
  return parsePlayProfileBasicInfo(html);
};
