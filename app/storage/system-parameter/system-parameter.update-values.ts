import { SystemParameter, SystemParameterValueUpdate } from '@/domain/system-parameter.model';
import { getPrismaClient } from '@/storage/utils';
import { Prisma } from '@/storage/client/client';
import { getRequestContentLocale } from '@/context/request-context';
import { dbSystemParameterToDomain } from './system-parameter.mappers';

export const dbSystemParameterUpdateValues = async (id: string, update: SystemParameterValueUpdate): Promise<SystemParameter> => {
  const prisma = getPrismaClient();
  const data: Prisma.SystemParameterUncheckedUpdateInput = {};
  if (update.valueNumber !== undefined) data.valueNumber = update.valueNumber;
  if (update.valueNumberMin !== undefined) data.valueNumberMin = update.valueNumberMin;
  if (update.valueNumberMax !== undefined) data.valueNumberMax = update.valueNumberMax;
  if (update.valueEuronormId !== undefined) data.valueEuronormId = update.valueEuronormId;

  const updated = await prisma.systemParameter.update({
    where: { id },
    data,
    include: { translations: true, valueEuronorm: true },
  });
  return dbSystemParameterToDomain(updated, getRequestContentLocale());
};
