import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbRoadAssistancePlanToDomain } from './road-assistance-plan.mappers';

export const dbRoadAssistancePlanRead = async (id: string): Promise<RoadAssistancePlan> => {
  const prisma = getPrismaClient();
  const roadAssistancePlan = await prisma.roadAssistancePlan.findUniqueOrThrow({
    where: { id },
    include: { translations: true },
  });
  return dbRoadAssistancePlanToDomain(roadAssistancePlan, getRequestContentLocale());
};
