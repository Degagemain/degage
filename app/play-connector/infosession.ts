import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay } from '@/play-connector/client';

export const playConnectorEnrollInfosession = async (userId: string, pcId: string): Promise<void> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  await fetchPlay(`/infosession/enroll?id=${encodeURIComponent(pcId)}`, cookieHeader);
};

export const playConnectorUnenrollInfosession = async (userId: string, _pcId: string): Promise<void> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  await fetchPlay('/infosession/unenroll', cookieHeader);
};
