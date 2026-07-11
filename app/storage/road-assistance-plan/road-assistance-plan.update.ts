import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbRoadAssistancePlanToDomain, roadAssistancePlanToDbUpdate } from './road-assistance-plan.mappers';

export const dbRoadAssistancePlanUpdate = async (roadAssistancePlan: RoadAssistancePlan): Promise<RoadAssistancePlan> => {
  const prisma = getPrismaClient();
  const updated = await prisma.roadAssistancePlan.update({
    where: { id: roadAssistancePlan.id! },
    data: roadAssistancePlanToDbUpdate(roadAssistancePlan),
    include: { translations: true },
  });
  return dbRoadAssistancePlanToDomain(updated, getRequestContentLocale());
};
