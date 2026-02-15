import { SystemParameter } from '@/domain/system-parameter.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbSystemParameterToDomain, systemParameterToDbCreate } from './system-parameter.mappers';

export const dbSystemParameterCreate = async (param: SystemParameter): Promise<SystemParameter> => {
  const prisma = getPrismaClient();
  const created = await prisma.systemParameter.create({
    data: systemParameterToDbCreate(param),
    include: { translations: true, valueEuronorm: true },
  });
  return dbSystemParameterToDomain(created, getRequestContentLocale());
};
