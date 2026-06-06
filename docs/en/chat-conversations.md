---
roles:
  - admin
---

# Support chats

## Purpose

Review support chat conversations between users and the assistant. Use this list to debug answers, inspect which documentation articles were
cited, and improve the help system.

## Properties

| Property     | Description                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| Channel      | **Chat** (in-app support widget) or **Email** (support mailbox thread)             |
| User         | Signed-in user who started the chat, or **Anonymous** for guest sessions           |
| Title        | Conversation title set by the user or derived from the first message; may be empty |
| Last updated | When the conversation was last active                                              |

Open a row to read the full message history. Assistant replies show a collapsible list of documentation articles used to build the answer.
