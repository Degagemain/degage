import type { EmailTemplate } from '@/domain/email-template.model';
import { dbEmailTemplateRead } from '@/storage/email-template/email-template.read';

export const readEmailTemplate = async (id: string): Promise<EmailTemplate> => dbEmailTemplateRead(id);
