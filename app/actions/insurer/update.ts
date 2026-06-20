import { Insurer, insurerSchema } from '@/domain/insurer.model';
import { dbInsurerUpdate } from '@/storage/insurer/insurer.update';

export const updateInsurer = async (insurer: Insurer): Promise<Insurer> => {
  const validated = insurerSchema.parse(insurer);
  return dbInsurerUpdate(validated);
};
