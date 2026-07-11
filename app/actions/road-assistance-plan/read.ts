import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { dbRoadAssistancePlanRead } from '@/storage/road-assistance-plan/road-assistance-plan.read';

export const readRoadAssistancePlan = async (id: string): Promise<RoadAssistancePlan> => {
  return dbRoadAssistancePlanRead(id);
};
