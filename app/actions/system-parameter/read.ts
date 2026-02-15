import { SystemParameter } from '@/domain/system-parameter.model';
import { dbSystemParameterRead, dbSystemParameterReadByCode } from '@/storage/system-parameter/system-parameter.read';

export const readSystemParameter = async (id: string): Promise<SystemParameter> => {
  return dbSystemParameterRead(id);
};

export const getSystemParameterByCode = async (code: string): Promise<SystemParameter | null> => {
  return dbSystemParameterReadByCode(code);
};
