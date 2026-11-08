import { CONTRACT_OWNER_PLACEHOLDER_EMAIL } from '@/domain/contract-type.model';

export type DocumensoRecipientRole = 'SIGNER' | 'APPROVER' | 'CC' | 'VIEWER';

export type DocumensoRecipientInput = {
  email: string;
  name: string;
  role: DocumensoRecipientRole;
  signingOrder?: number;
};

export type DocumensoRecipient = {
  id: number;
  email: string;
  name: string;
  role: DocumensoRecipientRole;
  signingOrder?: number | null;
  signingStatus?: string;
};

export type DocumensoEnvelopeItem = {
  id: string;
  title?: string;
  order?: number;
};

export type DocumensoEnvelope = {
  id: string;
  type?: string;
  status?: string;
  title?: string;
  externalId?: string | null;
  recipients?: DocumensoRecipient[];
  envelopeItems?: DocumensoEnvelopeItem[];
};

export type CreateTemplateInput = {
  title: string;
  externalId?: string;
  pdf: Buffer;
  fileName: string;
  recipients: DocumensoRecipientInput[];
};

export type UseTemplateRecipient = {
  id: number;
  email: string;
  name: string;
};

export type UseTemplateInput = {
  templateEnvelopeId: string;
  externalId: string;
  recipients: UseTemplateRecipient[];
  distributeDocument?: boolean;
};

export class DocumensoNotConfiguredError extends Error {
  constructor() {
    super('Documenso is not configured');
    this.name = 'DocumensoNotConfiguredError';
  }
}

export class DocumensoRequestError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`Documenso request failed (${status}): ${body}`);
    this.name = 'DocumensoRequestError';
    this.status = status;
    this.body = body;
  }
}

const DEFAULT_DOCUMENSO_APP_URL = 'https://stg-app.documenso.com';
const DEFAULT_DOCUMENSO_API_URL = `${DEFAULT_DOCUMENSO_APP_URL}/api/v2`;

const getConfig = () => {
  const apiKey = process.env.DOCUMENSO_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  const apiUrl = (process.env.DOCUMENSO_API_URL?.trim() || DEFAULT_DOCUMENSO_API_URL).replace(/\/$/, '');
  const appUrl = (process.env.DOCUMENSO_APP_URL?.trim() || DEFAULT_DOCUMENSO_APP_URL).replace(/\/$/, '');
  return { apiUrl, apiKey, appUrl };
};

export const isDocumensoConfigured = (): boolean => getConfig() !== null;

export const getDocumensoTemplateEditorUrl = (envelopeId: string): string | null => {
  const config = getConfig();
  if (!config?.appUrl) return null;
  return `${config.appUrl}/templates/${envelopeId}/edit`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const config = getConfig();
  if (!config) {
    throw new DocumensoNotConfiguredError();
  }

  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: config.apiKey,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new DocumensoRequestError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const createTemplateEnvelope = async (input: CreateTemplateInput): Promise<{ id: string }> => {
  const config = getConfig();
  if (!config) {
    throw new DocumensoNotConfiguredError();
  }

  const form = new FormData();
  form.append(
    'payload',
    JSON.stringify({
      type: 'TEMPLATE',
      title: input.title,
      externalId: input.externalId,
      recipients: input.recipients.map((recipient, index) => ({
        email: recipient.email,
        name: recipient.name,
        role: recipient.role,
        signingOrder: recipient.signingOrder ?? index + 1,
      })),
    }),
  );
  form.append('files', new Blob([new Uint8Array(input.pdf)], { type: 'application/pdf' }), input.fileName);

  const response = await fetch(`${config.apiUrl}/envelope/create`, {
    method: 'POST',
    headers: {
      Authorization: config.apiKey,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new DocumensoRequestError(response.status, body);
  }

  return (await response.json()) as { id: string };
};

export const getEnvelope = async (envelopeId: string): Promise<DocumensoEnvelope> => {
  return requestJson<DocumensoEnvelope>(`/envelope/${encodeURIComponent(envelopeId)}`);
};

export const redistributeEnvelope = async (envelopeId: string, recipientIds: number[]): Promise<void> => {
  if (recipientIds.length === 0) return;
  await requestJson('/envelope/redistribute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      envelopeId,
      recipients: recipientIds,
    }),
  });
};

export const createDocumentFromTemplate = async (input: UseTemplateInput): Promise<DocumensoEnvelope> => {
  const config = getConfig();
  if (!config) {
    throw new DocumensoNotConfiguredError();
  }

  const form = new FormData();
  form.append(
    'payload',
    JSON.stringify({
      envelopeId: input.templateEnvelopeId,
      externalId: input.externalId,
      recipients: input.recipients,
      distributeDocument: input.distributeDocument ?? true,
    }),
  );

  const response = await fetch(`${config.apiUrl}/envelope/use`, {
    method: 'POST',
    headers: {
      Authorization: config.apiKey,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new DocumensoRequestError(response.status, body);
  }

  return (await response.json()) as DocumensoEnvelope;
};

export const downloadEnvelopeItemPdf = async (envelopeItemId: string): Promise<Buffer> => {
  const config = getConfig();
  if (!config) {
    throw new DocumensoNotConfiguredError();
  }

  const response = await fetch(`${config.apiUrl}/envelope/item/${encodeURIComponent(envelopeItemId)}/download`, {
    headers: {
      Authorization: config.apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new DocumensoRequestError(response.status, body);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const downloadCompletedEnvelopePdf = async (envelopeId: string): Promise<{ fileName: string; body: Buffer }> => {
  const envelope = await getEnvelope(envelopeId);
  const item = [...(envelope.envelopeItems ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
  if (!item) {
    throw new DocumensoRequestError(404, `No envelope items found for ${envelopeId}`);
  }
  const body = await downloadEnvelopeItemPdf(item.id);
  return {
    fileName: item.title?.endsWith('.pdf') ? item.title : `${item.title || 'contract'}.pdf`,
    body,
  };
};

export const verifyDocumensoWebhookSecret = (request: Request): boolean => {
  const secret = process.env.DOCUMENSO_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return true;
  }
  const header = request.headers.get('x-documenso-secret') ?? request.headers.get('X-Documenso-Secret');
  return header === secret;
};

export const buildTemplateRecipients = (input: {
  defaultSignee?: { email: string; name: string } | null;
  defaultViewers?: { email: string; name: string }[];
}): DocumensoRecipientInput[] => {
  const recipients: DocumensoRecipientInput[] = [
    {
      email: CONTRACT_OWNER_PLACEHOLDER_EMAIL,
      name: 'Owner',
      role: 'SIGNER',
      signingOrder: 1,
    },
  ];

  if (input.defaultSignee) {
    recipients.push({
      email: input.defaultSignee.email,
      name: input.defaultSignee.name,
      role: 'SIGNER',
      signingOrder: 2,
    });
  }

  for (const viewer of input.defaultViewers ?? []) {
    recipients.push({
      email: viewer.email,
      name: viewer.name,
      role: 'CC',
    });
  }

  return recipients;
};

export const mapTemplateRecipientsForOwner = (
  templateRecipients: DocumensoRecipient[],
  owner: { email: string; name: string },
): UseTemplateRecipient[] => {
  return templateRecipients.map((recipient) => {
    if (recipient.email.toLowerCase() === CONTRACT_OWNER_PLACEHOLDER_EMAIL) {
      return {
        id: recipient.id,
        email: owner.email,
        name: owner.name,
      };
    }
    return {
      id: recipient.id,
      email: recipient.email,
      name: recipient.name || recipient.email,
    };
  });
};

export type RecipientSyncPlan = {
  toCreate: DocumensoRecipientInput[];
  toUpdate: Array<{ id: number; email: string; name: string; role: DocumensoRecipientRole; signingOrder?: number }>;
  toDelete: number[];
};

export const planRecipientSync = (existing: DocumensoRecipient[], desired: DocumensoRecipientInput[]): RecipientSyncPlan => {
  const desiredByEmail = new Map(desired.map((recipient) => [recipient.email.toLowerCase(), recipient]));
  const existingByEmail = new Map(existing.map((recipient) => [recipient.email.toLowerCase(), recipient]));

  const toCreate: DocumensoRecipientInput[] = [];
  const toUpdate: RecipientSyncPlan['toUpdate'] = [];
  const toDelete: number[] = [];

  for (const [email, desiredRecipient] of desiredByEmail) {
    const current = existingByEmail.get(email);
    if (!current) {
      toCreate.push(desiredRecipient);
      continue;
    }

    const signingOrderChanged = desiredRecipient.signingOrder !== undefined && current.signingOrder !== desiredRecipient.signingOrder;
    if (current.name !== desiredRecipient.name || current.role !== desiredRecipient.role || signingOrderChanged) {
      toUpdate.push({
        id: current.id,
        email: desiredRecipient.email,
        name: desiredRecipient.name,
        role: desiredRecipient.role,
        signingOrder: desiredRecipient.signingOrder,
      });
    }
  }

  for (const [email, current] of existingByEmail) {
    if (!desiredByEmail.has(email)) {
      toDelete.push(current.id);
    }
  }

  return { toCreate, toUpdate, toDelete };
};

export const createEnvelopeRecipients = async (envelopeId: string, recipients: DocumensoRecipientInput[]): Promise<void> => {
  if (recipients.length === 0) return;
  await requestJson('/envelope/recipient/create-many', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      envelopeId,
      data: recipients.map((recipient, index) => ({
        email: recipient.email,
        name: recipient.name,
        role: recipient.role,
        signingOrder: recipient.signingOrder ?? index + 1,
      })),
    }),
  });
};

export const updateEnvelopeRecipients = async (envelopeId: string, recipients: RecipientSyncPlan['toUpdate']): Promise<void> => {
  if (recipients.length === 0) return;
  await requestJson('/envelope/recipient/update-many', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      envelopeId,
      data: recipients.map((recipient) => ({
        id: recipient.id,
        email: recipient.email,
        name: recipient.name,
        role: recipient.role,
        signingOrder: recipient.signingOrder,
      })),
    }),
  });
};

export const deleteEnvelopeRecipient = async (recipientId: number): Promise<void> => {
  await requestJson('/envelope/recipient/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientId }),
  });
};

export const syncEnvelopeRecipients = async (envelopeId: string, desired: DocumensoRecipientInput[]): Promise<RecipientSyncPlan> => {
  const envelope = await getEnvelope(envelopeId);
  const plan = planRecipientSync(envelope.recipients ?? [], desired);

  for (const recipientId of plan.toDelete) {
    await deleteEnvelopeRecipient(recipientId);
  }
  await updateEnvelopeRecipients(envelopeId, plan.toUpdate);
  await createEnvelopeRecipients(envelopeId, plan.toCreate);

  return plan;
};
