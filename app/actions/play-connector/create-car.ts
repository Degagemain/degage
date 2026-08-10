import { type PlayCarCreateResult, playConnectorCreateCar } from '@/play-connector/cars';
import { type PlayCarCreateInput, playCarCreateInputSchema } from '@/play-connector/cars.model';

export const createPlayCar = async (userId: string, input: PlayCarCreateInput = {}): Promise<PlayCarCreateResult> => {
  const validated = playCarCreateInputSchema.parse(input);
  return playConnectorCreateCar(userId, validated);
};
