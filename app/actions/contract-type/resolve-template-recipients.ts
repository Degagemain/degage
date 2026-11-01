import type { ContractType } from '@/domain/contract-type.model';
import { type DocumensoRecipientInput, buildTemplateRecipients } from '@/integrations/documenso';
import { dbUserRead } from '@/storage/user/user.read';

export const resolveContractTypeTemplateRecipients = async (contractType: ContractType): Promise<DocumensoRecipientInput[]> => {
  let defaultSignee: { email: string; name: string } | null = null;
  if (contractType.defaultSignee) {
    const user = await dbUserRead(contractType.defaultSignee.id);
    defaultSignee = { email: user.email, name: user.name };
  }

  const defaultViewers: { email: string; name: string }[] = [];
  for (const viewer of contractType.defaultViewers) {
    const user = await dbUserRead(viewer.id);
    defaultViewers.push({ email: user.email, name: user.name });
  }

  return buildTemplateRecipients({ defaultSignee, defaultViewers });
};

export const haveContractTypeRecipientsChanged = (before: ContractType, after: ContractType): boolean => {
  const beforeSignee = before.defaultSignee?.id ?? null;
  const afterSignee = after.defaultSignee?.id ?? null;
  if (beforeSignee !== afterSignee) return true;

  const beforeViewers = [...before.defaultViewers.map((viewer) => viewer.id)].sort();
  const afterViewers = [...after.defaultViewers.map((viewer) => viewer.id)].sort();
  if (beforeViewers.length !== afterViewers.length) return true;
  return beforeViewers.some((id, index) => id !== afterViewers[index]);
};
