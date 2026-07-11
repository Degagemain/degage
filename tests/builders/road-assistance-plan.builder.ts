import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';

export const roadAssistancePlan = (data: Partial<RoadAssistancePlan> = {}): RoadAssistancePlan => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    name: data.name || 'Basic',
    description: data.description || 'Basic road assistance coverage.',
    isActive: data.isActive ?? true,
    translations: data.translations || [
      { locale: 'en', name: 'Basic', description: 'Basic road assistance coverage.' },
      { locale: 'nl', name: 'Basis', description: 'Basis pechverhelpingsdekking.' },
      { locale: 'fr', name: 'Basique', description: "Couverture d'assistance routière de base." },
    ],
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
