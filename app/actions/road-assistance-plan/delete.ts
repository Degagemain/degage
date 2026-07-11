import { dbRoadAssistancePlanDelete } from '@/storage/road-assistance-plan/road-assistance-plan.delete';

export const deleteRoadAssistancePlan = async (id: string): Promise<void> => {
  await dbRoadAssistancePlanDelete(id);
};
