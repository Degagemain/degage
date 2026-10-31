import { PrismaClient } from '@/storage/client/client';
import { SUPPORT_CHAT_FEATURE_FLAG } from '@/domain/feature-flag.model';

const featureFlags = [
  {
    code: SUPPORT_CHAT_FEATURE_FLAG,
    description: 'Controls whether support chat is available to users.',
    enabled: true,
  },
] as const;

export async function seedFeatureFlags(prisma: PrismaClient) {
  console.log('Seeding feature flags...');

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { code: flag.code },
      create: {
        code: flag.code,
        description: flag.description,
        enabled: flag.enabled,
      },
      update: {
        description: flag.description,
      },
    });
    console.log(`  Upserted: ${flag.code}`);
  }

  console.log('Feature flag seeding complete.');
}
