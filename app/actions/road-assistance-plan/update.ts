import * as z from 'zod';
import { RoadAssistancePlan, roadAssistancePlanSchema } from '@/domain/road-assistance-plan.model';
import { dbRoadAssistancePlanUpdate } from '@/storage/road-assistance-plan/road-assistance-plan.update';

export const updateRoadAssistancePlan = async (roadAssistancePlan: RoadAssistancePlan): Promise<RoadAssistancePlan> => {
  const validated = roadAssistancePlanSchema.parse(roadAssistancePlan);
  z.uuid().parse(validated.id);
  return dbRoadAssistancePlanUpdate(validated);
};
