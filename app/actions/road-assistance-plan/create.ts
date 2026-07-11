import { RoadAssistancePlan, roadAssistancePlanSchema } from '@/domain/road-assistance-plan.model';
import { dbRoadAssistancePlanCreate } from '@/storage/road-assistance-plan/road-assistance-plan.create';

export const createRoadAssistancePlan = async (roadAssistancePlan: RoadAssistancePlan): Promise<RoadAssistancePlan> => {
  const validated = roadAssistancePlanSchema.parse(roadAssistancePlan);
  return dbRoadAssistancePlanCreate(validated);
};
