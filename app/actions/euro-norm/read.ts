import { EuroNorm } from '@/domain/euro-norm.model';
import { dbEuroNormRead } from '@/storage/euro-norm/euro-norm.read';

export const readEuroNorm = async (id: string): Promise<EuroNorm> => {
  return dbEuroNormRead(id);
};
