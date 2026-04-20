import { NextResponse } from 'next/server';
import { deleteNotionDocumentation, syncNotionPageToDocumentation } from '@/actions/notion/sync-page-to-documentation';
import { verifyNotionWebhookSignature } from '@/actions/notion/verify-webhook-signature';
import { withPublic } from '@/api/with-context';

export const runtime = 'nodejs';

type NotionWebhookBody = {
  verification_token?: string;
  type?: string;
  entity?: { id?: string; type?: string };
};

export const POST = withPublic(async (request) => {
  const verificationToken = process.env.NOTION_WEBHOOK_VERIFICATION_TOKEN;
  const rawBody = await request.text();
  const signature = request.headers.get('x-notion-signature');

  if (verificationToken) {
    const trusted = verifyNotionWebhookSignature(rawBody, signature, verificationToken);
    if (!trusted) {
      return NextResponse.json({ code: 'invalid_signature', errors: [{ message: 'Invalid webhook signature' }] }, { status: 401 });
    }
  }

  let body: NotionWebhookBody;
  try {
    body = JSON.parse(rawBody) as NotionWebhookBody;
  } catch {
    return NextResponse.json({ code: 'invalid_json', errors: [{ message: 'Invalid JSON' }] }, { status: 400 });
  }

  if (body.verification_token !== undefined && body.type === undefined) {
    if (!verificationToken) {
      console.info(
        '[notion webhook] Verification: paste into Notion → Webhooks → Verify; then set NOTION_WEBHOOK_VERIFICATION_TOKEN.\n',
        body.verification_token,
      );
    }
    return new NextResponse(null, { status: 200 });
  }

  const entity = body.entity;
  if (!entity?.id || entity.type !== 'page' || !body.type) {
    return new NextResponse(null, { status: 200 });
  }

  const pageId = entity.id;

  try {
    if (body.type === 'page.deleted') {
      await deleteNotionDocumentation(pageId);
    } else if (
      body.type === 'page.created' ||
      body.type === 'page.content_updated' ||
      body.type === 'page.properties_updated' ||
      body.type === 'page.undeleted' ||
      body.type === 'page.moved'
    ) {
      await syncNotionPageToDocumentation(pageId);
    }
  } catch (e) {
    console.error('[notion webhook]', e);
    return NextResponse.json({ code: 'sync_failed', errors: [{ message: 'Failed to sync documentation' }] }, { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
});
