import { Insurer, insurerSchema } from '@/domain/insurer.model';
import { dbInsurerCreate } from '@/storage/insurer/insurer.create';

export const createInsurer = async (insurer: Insurer): Promise<Insurer> => {
  const validated = insurerSchema.parse(insurer);
  return dbInsurerCreate(validated);
};
