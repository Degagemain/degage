import { FeatureFlag } from '@/domain/feature-flag.model';

export const featureFlag = (data: Partial<FeatureFlag> = {}): FeatureFlag => {
  return {
    id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
    code: data.code ?? 'support-chat',
    description: data.description ?? 'Controls whether support chat is available to users.',
    enabled: data.enabled ?? true,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};
