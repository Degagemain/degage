import { type PlayCarUpdateInput, playCarUpdateInputSchema } from '@/play-connector/cars.model';
import { playConnectorUpdateCar } from '@/play-connector/cars';

export const updatePlayCar = async (adminModeUserId: string, carId: number, input: PlayCarUpdateInput = {}): Promise<void> => {
  const validated = playCarUpdateInputSchema.parse(input);
  await playConnectorUpdateCar(adminModeUserId, carId, validated);
};
