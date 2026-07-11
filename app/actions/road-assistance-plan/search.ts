import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';
import { RoadAssistancePlanFilter } from '@/domain/road-assistance-plan.filter';
import { Page } from '@/domain/page.model';
import { dbRoadAssistancePlanSearch } from '@/storage/road-assistance-plan/road-assistance-plan.search';

export const searchRoadAssistancePlans = async (filter: RoadAssistancePlanFilter): Promise<Page<RoadAssistancePlan>> => {
  return dbRoadAssistancePlanSearch(filter);
};
