import { dbEuroNormDelete } from '@/storage/euro-norm/euro-norm.delete';

export const deleteEuroNorm = async (id: string): Promise<void> => {
  await dbEuroNormDelete(id);
};
