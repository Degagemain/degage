import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';

export const unenrollPlayInfosession = async (userId: string): Promise<void> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  await fetchPlay('/infosession/unenroll', cookieHeader);
};
