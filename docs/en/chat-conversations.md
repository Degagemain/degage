---
roles:
  - admin
---

# Chat threads

## Purpose

The chat threads page helps admins debug support chatbot answers and improve the help content used by the assistant.

## Properties

| Property | Description                                                        |
| -------- | ------------------------------------------------------------------ |
| Title    | The stored chat title. It can be empty for new or untitled chats.  |
| User     | The user linked to the chat, or Anonymous when no user was stored. |
| Created  | When the thread was created.                                       |
| Updated  | When the thread was last updated.                                  |

Open a thread to view the full chat history. Assistant messages can include a collapsed tool calls section with the articles used to build the
answer.
