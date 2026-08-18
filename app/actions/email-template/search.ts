import type { EmailTemplate } from '@/domain/email-template.model';
import type { EmailTemplateFilter } from '@/domain/email-template.filter';
import { Page } from '@/domain/page.model';
import { dbEmailTemplateSearch } from '@/storage/email-template/email-template.search';

export const searchEmailTemplates = async (filter: EmailTemplateFilter): Promise<Page<EmailTemplate>> => dbEmailTemplateSearch(filter);
