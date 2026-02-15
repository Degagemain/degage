import { SystemParameter } from '@/domain/system-parameter.model';
import { type SystemParameterValueUpdate, systemParameterValueUpdateSchema } from '@/domain/system-parameter.model';
import { dbSystemParameterUpdateValues } from '@/storage/system-parameter/system-parameter.update-values';

export const updateSystemParameterValues = async (id: string, payload: unknown): Promise<SystemParameter> => {
  const update = systemParameterValueUpdateSchema.parse(payload) as SystemParameterValueUpdate;
  return dbSystemParameterUpdateValues(id, update);
};
