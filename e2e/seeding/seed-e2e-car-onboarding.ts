import { getPrismaClient } from '../../app/storage/utils';

import { E2E_CAR_ONBOARDING } from '../car-onboarding-fixtures';
import { E2E_USER_EMAIL } from '../constants';

export async function seedE2eCarOnboarding(): Promise<void> {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({ where: { email: E2E_USER_EMAIL } });
  if (!user) {
    throw new Error(`E2E user not found: ${E2E_USER_EMAIL}`);
  }

  await prisma.playConnector.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      email: user.email,
      encryptedPassword: 'e2e',
      encryptedSessionCookie: null,
      sessionExpiresAt: null,
      credentialsInvalid: false,
      failedLoginCount: 0,
      loginBlockedUntil: null,
    },
  });

  const insurer =
    (await prisma.insurer.findFirst({ where: { name: E2E_CAR_ONBOARDING.insurer.name } })) ??
    (await prisma.insurer.create({
      data: {
        name: E2E_CAR_ONBOARDING.insurer.name,
      },
    }));

  const existingTranslation = await prisma.roadAssistancePlanTranslation.findFirst({
    where: { locale: 'en', name: E2E_CAR_ONBOARDING.roadAssistancePlan.name },
    select: { roadAssistancePlanId: true },
  });

  const roadAssistancePlan = existingTranslation
    ? await prisma.roadAssistancePlan.findUniqueOrThrow({ where: { id: existingTranslation.roadAssistancePlanId } })
    : await prisma.roadAssistancePlan.create({
        data: {
          isActive: true,
          translations: {
            create: [{ locale: 'en', name: E2E_CAR_ONBOARDING.roadAssistancePlan.name, description: 'E2E seed plan' }],
          },
        },
      });

  await prisma.carOnboarding.upsert({
    where: { id: E2E_CAR_ONBOARDING.id },
    update: {
      ownerId: user.id,
      infoSessionPcId: E2E_CAR_ONBOARDING.infoSessionPcId,
      infoSessionDate: new Date(E2E_CAR_ONBOARDING.infoSessionDateIso),
      infoSessionStatus: 'done',
      carValue: E2E_CAR_ONBOARDING.carValue.proposedValue,
      insurerId: insurer.id,
      roadAssistancePlanId: roadAssistancePlan.id,
    },
    create: {
      id: E2E_CAR_ONBOARDING.id,
      ownerId: user.id,
      infoSessionPcId: E2E_CAR_ONBOARDING.infoSessionPcId,
      infoSessionDate: new Date(E2E_CAR_ONBOARDING.infoSessionDateIso),
      infoSessionStatus: 'done',
      carValue: E2E_CAR_ONBOARDING.carValue.proposedValue,
      insurerId: insurer.id,
      roadAssistancePlanId: roadAssistancePlan.id,
    },
  });

  console.log(`E2E car onboarding seeded: ${E2E_CAR_ONBOARDING.id}`);
}
