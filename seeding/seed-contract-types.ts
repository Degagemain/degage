import { PrismaClient } from '@/storage/client/client';
import { ContractTypeCode } from '@/domain/contract-type.model';

export async function seedContractTypes(prisma: PrismaClient) {
  console.log('Seeding contract types...');

  const existing = await prisma.contractType.findUnique({
    where: { code: ContractTypeCode.CarOnboarding },
  });
  if (existing) {
    console.log(`  Skipped existing: ${ContractTypeCode.CarOnboarding}`);
    console.log('Contract type seeding complete.');
    return;
  }

  await prisma.contractType.create({
    data: {
      code: ContractTypeCode.CarOnboarding,
      name: 'Car onboarding',
    },
  });
  console.log(`  Seeded: ${ContractTypeCode.CarOnboarding}`);
  console.log('Contract type seeding complete.');
}
