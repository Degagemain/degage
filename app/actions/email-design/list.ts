import type { EmailDesign } from '@/domain/email-design.model';
import { requireResendClient } from './resend-client';
import { ResendRequestError } from './resend-request.error';

const mapListItem = (item: { id: string; name: string; alias: string | null; status: 'draft' | 'published' }): EmailDesign => ({
  id: item.id,
  name: item.name,
  alias: item.alias,
  status: item.status,
  variables: [],
});

export const listEmailDesigns = async (): Promise<EmailDesign[]> => {
  const resend = requireResendClient();
  const records: EmailDesign[] = [];
  let after: string | undefined;

  do {
    const result = await resend.templates.list({ limit: 100, ...(after ? { after } : {}) });
    if (result.error) {
      throw new ResendRequestError(result.error.message, result.error.statusCode ?? 502);
    }
    const page = result.data?.data ?? [];
    records.push(...page.map(mapListItem));
    after = result.data?.has_more ? page[page.length - 1]?.id : undefined;
  } while (after);

  return records;
};
