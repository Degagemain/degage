import * as z from 'zod';
import { EuroNorm, euroNormSchema } from '@/domain/euro-norm.model';
import { dbEuroNormUpdate } from '@/storage/euro-norm/euro-norm.update';

export const updateEuroNorm = async (euroNorm: EuroNorm): Promise<EuroNorm> => {
  const validated = euroNormSchema.parse(euroNorm);
  z.uuid().parse(validated.id);
  return dbEuroNormUpdate(validated);
};
