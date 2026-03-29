---
roles:
  - technical
---

# Support Email Channel

Inbound support emails are handled through Resend webhooks and stored in the same chat conversation storage used by the frontend support chat.

## Environment variables

- `BOT_SUPPORT_MAIL`: mailbox address accepted by the support webhook.
- `RESEND_API_KEY`: required to fetch inbound email content and send support replies.
- `RESEND_FROM`: sender used for outbound support replies.
- `RESEND_WEBHOOK_SECRET`: optional webhook signature secret (`whsec_...`).

## Webhook flow

1. Resend sends `email.received` to `POST /api/webhooks/resend`.
2. The route validates that at least one `to` address matches `BOT_SUPPORT_MAIL`.
3. The route returns `200` immediately and continues processing in `after(...)`.
4. Background processing fetches the full inbound email content with `resend.emails.receiving.get(email_id)`.
5. A conversation is found or created with medium `email` and `emailThreadId`.
6. Inbound message is stored with `externalMessageId` (`message_id` from webhook event).
7. Shared support generation logic produces a plain, formal email reply as a public viewer.
8. Reply is sent with threading headers (`In-Reply-To`, `References`) when available, and the assistant message is persisted.

## Storage model changes

- `ChatConversation.medium`: `frontend` or `email`
- `ChatConversation.emailThreadId`: thread key for email conversations
- `ChatMessage.externalMessageId`: provider message id used for threading/idempotency
