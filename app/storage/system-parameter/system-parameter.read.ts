import { SystemParameter } from '@/domain/system-parameter.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbSystemParameterToDomain } from './system-parameter.mappers';

export const dbSystemParameterRead = async (id: string): Promise<SystemParameter> => {
  const prisma = getPrismaClient();
  const param = await prisma.systemParameter.findUniqueOrThrow({
    where: { id },
    include: { translations: true, valueEuronorm: true },
  });
  return dbSystemParameterToDomain(param, getRequestContentLocale());
};

export const dbSystemParameterReadByCode = async (code: string): Promise<SystemParameter | null> => {
  const prisma = getPrismaClient();
  const param = await prisma.systemParameter.findUnique({
    where: { code },
    include: { translations: true, valueEuronorm: true },
  });
  if (!param) return null;
  return dbSystemParameterToDomain(param, getRequestContentLocale());
};
