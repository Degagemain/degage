import { EuroNorm, euroNormSchema } from '@/domain/euro-norm.model';
import { dbEuroNormCreate } from '@/storage/euro-norm/euro-norm.create';

export const createEuroNorm = async (euroNorm: EuroNorm): Promise<EuroNorm> => {
  const validated = euroNormSchema.parse(euroNorm);
  return dbEuroNormCreate(validated);
};
