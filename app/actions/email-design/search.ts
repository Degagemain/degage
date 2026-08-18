import type { EmailDesign } from '@/domain/email-design.model';
import { Page } from '@/domain/page.model';
import { listEmailDesigns } from './list';

export const searchEmailDesigns = async (): Promise<Page<EmailDesign>> => {
  const records = await listEmailDesigns();
  return { records, total: records.length };
};
