import { PrismaClient } from '@/storage/client/client';
import {
  buildSupportAssistantChatBasePrompt,
  buildSupportAssistantEmailBasePrompt,
  defaultSupportAssistantContactEmail,
  supportAssistantPromptSystemParameterCodes,
} from '@/domain/support-assistant-prompt.model';

const supportAssistantPrompts = [
  {
    code: supportAssistantPromptSystemParameterCodes.chat,
    valueString: buildSupportAssistantChatBasePrompt(defaultSupportAssistantContactEmail),
    translations: [
      {
        locale: 'en',
        name: 'Assistant base prompt (chat widget)',
        description: 'Base prompt used by the documentation assistant in the chat widget.',
      },
      {
        locale: 'nl',
        name: 'Assistentbasisprompt (chatwidget)',
        description: 'Basisprompt voor de documentatieassistent in de chatwidget.',
      },
      {
        locale: 'fr',
        name: "Prompt de base de l'assistant (widget de chat)",
        description: "Prompt de base utilise par l'assistant de documentation dans le widget de chat.",
      },
    ],
  },
  {
    code: supportAssistantPromptSystemParameterCodes.email,
    valueString: buildSupportAssistantEmailBasePrompt(defaultSupportAssistantContactEmail),
    translations: [
      {
        locale: 'en',
        name: 'Assistant base prompt (email)',
        description: 'Base prompt used by the documentation assistant for inbound support emails.',
      },
      {
        locale: 'nl',
        name: 'Assistentbasisprompt (e-mail)',
        description: 'Basisprompt voor de documentatieassistent bij inkomende supportmails.',
      },
      {
        locale: 'fr',
        name: "Prompt de base de l'assistant (e-mail)",
        description: "Prompt de base utilise par l'assistant de documentation pour les e-mails de support entrants.",
      },
    ],
  },
] as const;

export async function seedSupportAssistantPrompts(prisma: PrismaClient) {
  console.log('Seeding support assistant prompts...');

  for (const prompt of supportAssistantPrompts) {
    const existing = await prisma.systemParameter.findUnique({ where: { code: prompt.code } });
    if (existing) {
      console.log(`  Skipped existing: ${prompt.code}`);
      continue;
    }

    await prisma.systemParameter.create({
      data: {
        code: prompt.code,
        category: 'assistant',
        type: 'string',
        valueString: prompt.valueString,
        translations: {
          createMany: { data: [...prompt.translations] },
        },
      },
    });
    console.log(`  Seeded: ${prompt.code}`);
  }

  console.log('Support assistant prompt seeding complete.');
}
