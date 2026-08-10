import { type PlayCarCreateResult, playConnectorCreateCar } from '@/play-connector/cars';

export const createPlayCar = async (userId: string): Promise<PlayCarCreateResult> => {
  return playConnectorCreateCar(userId);
};
