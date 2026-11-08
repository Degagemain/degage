import { PrismaClient } from '@/storage/client/client';
import { ContractTypeCode } from '@/domain/contract-type.model';

const seedTypes = [{ code: ContractTypeCode.CarOnboarding }] as const;

export async function seedContractTypes(prisma: PrismaClient) {
  console.log('Seeding contract types...');

  for (const type of seedTypes) {
    const existing = await prisma.contractType.findUnique({ where: { code: type.code } });
    if (existing) {
      console.log(`  Skipped existing: ${type.code}`);
      continue;
    }
    await prisma.contractType.create({
      data: {
        code: type.code,
      },
    });
    console.log(`  Seeded: ${type.code}`);
  }

  console.log('Contract type seeding complete.');
}
