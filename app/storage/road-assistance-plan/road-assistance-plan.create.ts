import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbRoadAssistancePlanToDomain, roadAssistancePlanToDbCreate } from './road-assistance-plan.mappers';

export const dbRoadAssistancePlanCreate = async (roadAssistancePlan: RoadAssistancePlan): Promise<RoadAssistancePlan> => {
  const prisma = getPrismaClient();
  const created = await prisma.roadAssistancePlan.create({
    data: roadAssistancePlanToDbCreate(roadAssistancePlan),
    include: { translations: true },
  });
  return dbRoadAssistancePlanToDomain(created, getRequestContentLocale());
};
