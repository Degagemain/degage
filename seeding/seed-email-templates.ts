import { PrismaClient } from '@/storage/client/client';
import {
  BUTTON_EMAIL_DESIGN_ALIAS,
  SIMULATION_MANUAL_REVIEW_EMAIL_DESIGN_ALIAS,
  SIMULATION_RESULTS_EMAIL_DESIGN_ALIAS,
  TemplatesEnum,
} from '@/domain/email-template.model';

const pricesLink = 'https://www.degage.be/de-prijzen/';
const pricesLinkHtml = (label: string) => `<a href="${pricesLink}" style="color:#388E3C;text-decoration:underline;">${label}</a>`;

const verificationVariables = {
  en: {
    SUBJECT: 'Confirm your email',
    PREHEADER: 'Finish signing up — confirm your email.',
    HEADER: 'Email verification',
    HEADING: 'Confirm your email',
    BODY: 'Thanks for signing up. Use the button below to verify your email address.',
    BUTTON_TEXT: 'Confirm email',
    BUTTON_URL: '',
    FALLBACK_HINT: 'If the button does not work, copy and paste this link into your browser:',
    FOOTER: 'If you did not create an account, you can ignore this email.',
  },
  nl: {
    SUBJECT: 'Bevestig je e-mailadres',
    PREHEADER: 'Rond je registratie af — bevestig je e-mail.',
    HEADER: 'E-mailverificatie',
    HEADING: 'Bevestig je e-mailadres',
    BODY: 'Bedankt voor je registratie. Gebruik de knop hieronder om je e-mailadres te bevestigen.',
    BUTTON_TEXT: 'E-mail bevestigen',
    BUTTON_URL: '',
    FALLBACK_HINT: 'Werkt de knop niet? Kopieer en plak deze link in je browser:',
    FOOTER: 'Heb je geen account aangemaakt? Dan kun je deze e-mail negeren.',
  },
  fr: {
    SUBJECT: 'Confirmez votre adresse e-mail',
    PREHEADER: 'Terminez votre inscription — confirmez votre e-mail.',
    HEADER: 'Vérification e-mail',
    HEADING: 'Confirmez votre adresse e-mail',
    BODY: 'Merci pour votre inscription. Utilisez le bouton ci-dessous pour confirmer votre adresse e-mail.',
    BUTTON_TEXT: "Confirmer l'e-mail",
    BUTTON_URL: '',
    FALLBACK_HINT: 'Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :',
    FOOTER: "Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.",
  },
} as const;

const resetPasswordVariables = {
  en: {
    SUBJECT: 'Reset your password',
    PREHEADER: 'Reset your password — use the link in this email.',
    HEADER: 'Password reset',
    HEADING: 'Reset your password',
    BODY: 'We received a request to reset your password. Use the button below to choose a new one.',
    BUTTON_TEXT: 'Reset password',
    BUTTON_URL: '',
    FALLBACK_HINT: 'If the button does not work, copy and paste this link into your browser:',
    FOOTER: 'If you did not request a password reset, you can ignore this email. The link expires after a short time.',
  },
  nl: {
    SUBJECT: 'Stel je wachtwoord opnieuw in',
    PREHEADER: 'Stel je wachtwoord opnieuw in — link in deze e-mail.',
    HEADER: 'Wachtwoord resetten',
    HEADING: 'Stel je wachtwoord opnieuw in',
    BODY: 'We hebben een verzoek gekregen om je wachtwoord te resetten. Gebruik de knop hieronder om een nieuw wachtwoord te kiezen.',
    BUTTON_TEXT: 'Wachtwoord resetten',
    BUTTON_URL: '',
    FALLBACK_HINT: 'Werkt de knop niet? Kopieer en plak deze link in je browser:',
    FOOTER: 'Heb je geen reset aangevraagd? Dan kun je deze e-mail negeren. De link verloopt na korte tijd.',
  },
  fr: {
    SUBJECT: 'Réinitialisez votre mot de passe',
    PREHEADER: 'Réinitialisez votre mot de passe — lien dans cet e-mail.',
    HEADER: 'Réinitialisation du mot de passe',
    HEADING: 'Réinitialisez votre mot de passe',
    BODY: 'Nous avons reçu une demande de réinitialisation de votre mot de passe. Utilisez le bouton ci-dessous pour en choisir un nouveau.',
    BUTTON_TEXT: 'Réinitialiser le mot de passe',
    BUTTON_URL: '',
    FALLBACK_HINT: 'Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :',
    FOOTER: "Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail. Le lien expire après un court délai.",
  },
} as const;

const simulationFieldLabels = {
  en: {
    LABEL_TOWN: 'Town:',
    LABEL_BRAND: 'Brand:',
    LABEL_FUEL: 'Fuel type:',
    LABEL_PURCHASED: 'Purchased car:',
    LABEL_MILEAGE: 'Mileage:',
    LABEL_VALUE: 'Car value:',
    LABEL_DEPRECIATION: 'Depreciation rate:',
    LINK_INTRO: 'You can return to your result anytime using this link:',
    BUTTON_TEXT: 'View your simulation',
    HEADER: 'Simulation',
    GREETING: 'Hello,',
  },
  nl: {
    LABEL_TOWN: 'Gemeente/stad:',
    LABEL_BRAND: 'Merk:',
    LABEL_FUEL: 'Brandstof:',
    LABEL_PURCHASED: 'Aangekochte wagen:',
    LABEL_MILEAGE: 'Kilometerstand:',
    LABEL_VALUE: 'Waarde wagen:',
    LABEL_DEPRECIATION: 'Afschrijving per km:',
    LINK_INTRO: 'Je kunt je resultaat altijd terugvinden via deze link:',
    BUTTON_TEXT: 'Bekijk je simulatie',
    HEADER: 'Simulatie',
    GREETING: 'Hallo,',
  },
  fr: {
    LABEL_TOWN: 'Ville/commune :',
    LABEL_BRAND: 'Marque :',
    LABEL_FUEL: 'Carburant :',
    LABEL_PURCHASED: 'Véhicule acheté :',
    LABEL_MILEAGE: 'Kilométrage :',
    LABEL_VALUE: 'Valeur du véhicule :',
    LABEL_DEPRECIATION: 'Dépréciation par km :',
    LINK_INTRO: 'Vous pouvez retrouver votre résultat à tout moment via ce lien :',
    BUTTON_TEXT: 'Voir votre simulation',
    HEADER: 'Simulation',
    GREETING: 'Bonjour,',
  },
} as const;

const simulationResultsVariables = {
  en: {
    ...simulationFieldLabels.en,
    SUBJECT: 'Your Dégage simulation result',
    HEADING: 'Your simulation result',
    BODY: `Here is a summary of your simulation. Your car fits in the Dégage fleet. ${pricesLinkHtml('Here')} you can find more information about the categories and matching per-km rates.`,
    FOOTER: 'Questions? Reply to this email.',
  },
  nl: {
    ...simulationFieldLabels.nl,
    SUBJECT: 'Resultaat van je simulatie bij Dégage',
    HEADING: 'Je simulatieresultaat',
    BODY: `Hier vind je de samenvatting van je simulatie. Je auto past in de Dégage-vloot. ${pricesLinkHtml('Hier')} vind je meer uitleg rond de categorieën en de bijpassende kilometerprijzen.`,
    FOOTER: 'Vragen? Antwoord op deze e-mail.',
  },
  fr: {
    ...simulationFieldLabels.fr,
    SUBJECT: 'Résultat de votre simulation chez Dégage',
    HEADING: 'Résultat de votre simulation',
    BODY: `Voici le résumé de votre simulation. Votre voiture entre dans la flotte Dégage. ${pricesLinkHtml('Ici')}, vous trouverez plus d'informations sur les catégories et les tarifs kilométriques correspondants.`,
    FOOTER: 'Des questions ? Répondez à cet e-mail.',
  },
} as const;

const simulationManualReviewVariables = {
  en: {
    ...simulationFieldLabels.en,
    SUBJECT: 'Your car sharing check needs a manual review',
    HEADING: 'Manual review',
    BODY: 'Your simulation did not get an automatic yes or no. Our team will look at your details and follow up by email.',
    FOOTER: 'Reply to this email if you have questions.',
  },
  nl: {
    ...simulationFieldLabels.nl,
    SUBJECT: 'Je autodelen-check vraagt een handmatige beoordeling',
    HEADING: 'Handmatige beoordeling',
    BODY: 'Je simulatie kreeg geen automatische ja- of nee-uitslag. Ons team bekijkt je gegevens en volgt per e-mail op.',
    FOOTER: 'Vragen? Antwoord op deze e-mail.',
  },
  fr: {
    ...simulationFieldLabels.fr,
    SUBJECT: "Votre simulation d'autopartage nécessite un examen manuel",
    HEADING: 'Examen manuel',
    BODY: "Votre simulation n'a pas abouti à un oui ou non automatique. Notre équipe examine votre dossier et vous recontactera par e-mail.",
    FOOTER: 'Des questions ? Répondez à cet e-mail.',
  },
} as const;

const buttonFallback = {
  en: 'If the button does not work, copy and paste this link into your browser:',
  nl: 'Werkt de knop niet? Kopieer en plak deze link in je browser:',
  fr: 'Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :',
} as const;

const simulationResultsSupportVariables = {
  en: {
    SUBJECT: '[Support] New simulation — result sent',
    PREHEADER: 'A simulation result was sent to a user.',
    HEADER: 'Internal',
    HEADING: 'Simulation — internal notification',
    BODY: 'A simulation result was sent to {{{RECIPIENT_EMAIL}}}. Purchased car: {{{IS_PURCHASED}}}. Open the simulation in admin for the full summary.',
    BUTTON_TEXT: 'Open in admin',
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.en,
    FOOTER: 'Reply to this email to contact the user.',
  },
  nl: {
    SUBJECT: '[Support] Nieuwe simulatie — resultaat verstuurd',
    PREHEADER: 'Er is een simulatieresultaat naar een gebruiker verstuurd.',
    HEADER: 'Intern',
    HEADING: 'Simulatie — interne notificatie',
    BODY: 'Er is een simulatieresultaat naar {{{RECIPIENT_EMAIL}}} verstuurd. Aangekochte wagen: {{{IS_PURCHASED}}}. Open de simulatie in admin voor de volledige samenvatting.',
    BUTTON_TEXT: 'Open in admin',
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.nl,
    FOOTER: 'Antwoord op deze e-mail om de gebruiker te contacteren.',
  },
  fr: {
    SUBJECT: '[Support] Nouvelle simulation — résultat envoyé',
    PREHEADER: 'Un résultat de simulation a été envoyé à un utilisateur.',
    HEADER: 'Interne',
    HEADING: 'Simulation — notification interne',
    BODY: "Un résultat de simulation a été envoyé à {{{RECIPIENT_EMAIL}}}. Véhicule acheté : {{{IS_PURCHASED}}}. Ouvrez la simulation dans l'admin pour le résumé complet.",
    BUTTON_TEXT: "Ouvrir dans l'admin",
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.fr,
    FOOTER: "Répondez à cet e-mail pour contacter l'utilisateur.",
  },
} as const;

const simulationManualReviewSupportVariables = {
  en: {
    SUBJECT: '[Internal] Manual review — simulation',
    PREHEADER: 'A simulation needs a manual review.',
    HEADER: 'Internal',
    HEADING: 'Manual review — internal notification',
    BODY: 'A user requested a manual review or provided an email address for a simulation with this outcome. User email: {{{RECIPIENT_EMAIL}}}. Purchased car: {{{IS_PURCHASED}}}.',
    BUTTON_TEXT: 'Open in admin',
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.en,
    FOOTER: 'Reply to this email to contact the user.',
  },
  nl: {
    SUBJECT: '[Intern] Handmatige beoordeling — simulatie',
    PREHEADER: 'Een simulatie vraagt een handmatige beoordeling.',
    HEADER: 'Intern',
    HEADING: 'Handmatige beoordeling — interne notificatie',
    BODY: 'Een gebruiker heeft een handmatige beoordeling aangevraagd of een e-mailadres opgegeven bij een simulatie met deze uitkomst. Gebruikerse-mail: {{{RECIPIENT_EMAIL}}}. Aangekochte wagen: {{{IS_PURCHASED}}}.',
    BUTTON_TEXT: 'Open in admin',
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.nl,
    FOOTER: 'Antwoord op deze e-mail om de gebruiker te contacteren.',
  },
  fr: {
    SUBJECT: '[Interne] Examen manuel — simulation',
    PREHEADER: 'Une simulation nécessite un examen manuel.',
    HEADER: 'Interne',
    HEADING: 'Examen manuel — notification interne',
    BODY: 'Un utilisateur a demandé un examen manuel ou a fourni une adresse e-mail pour une simulation avec ce résultat. E-mail utilisateur : {{{RECIPIENT_EMAIL}}}. Véhicule acheté : {{{IS_PURCHASED}}}.',
    BUTTON_TEXT: "Ouvrir dans l'admin",
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.fr,
    FOOTER: "Répondez à cet e-mail pour contacter l'utilisateur.",
  },
} as const;

const carOnboardingPreparationNudgeVariables = {
  en: {
    SUBJECT: 'Complete your car onboarding',
    PREHEADER: 'A few details are still missing before your car can join Dégage.',
    HEADER: 'Car onboarding',
    HEADING: 'Finish your car profile',
    BODY: 'You started adding your car to Dégage, but some details are still missing. Continue your onboarding so we can keep going.',
    BUTTON_TEXT: 'Continue onboarding',
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.en,
    FOOTER: 'Questions? Reply to this email.',
  },
  nl: {
    SUBJECT: 'Rond je wagenonboarding af',
    PREHEADER: 'Er ontbreken nog gegevens voordat je wagen bij Dégage kan.',
    HEADER: 'Wagenonboarding',
    HEADING: 'Vul je wagenprofiel verder in',
    BODY: 'Je bent begonnen met het toevoegen van je wagen bij Dégage, maar er ontbreken nog gegevens. Ga verder met je onboarding zodat we kunnen verdergaan.',
    BUTTON_TEXT: 'Verdergaan met onboarding',
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.nl,
    FOOTER: 'Vragen? Antwoord op deze e-mail.',
  },
  fr: {
    SUBJECT: "Terminez l'intégration de votre voiture",
    PREHEADER: 'Quelques informations manquent encore avant que votre voiture puisse rejoindre Dégage.',
    HEADER: 'Intégration voiture',
    HEADING: 'Complétez le profil de votre voiture',
    BODY: "Vous avez commencé à ajouter votre voiture chez Dégage, mais il manque encore des informations. Poursuivez l'intégration pour que nous puissions avancer.",
    BUTTON_TEXT: "Continuer l'intégration",
    BUTTON_URL: '',
    FALLBACK_HINT: buttonFallback.fr,
    FOOTER: 'Des questions ? Répondez à cet e-mail.',
  },
} as const;

const templates = [
  { code: TemplatesEnum.VerificationEmail, designId: BUTTON_EMAIL_DESIGN_ALIAS, variables: verificationVariables },
  { code: TemplatesEnum.ResetPasswordEmail, designId: BUTTON_EMAIL_DESIGN_ALIAS, variables: resetPasswordVariables },
  { code: TemplatesEnum.SimulationResultsEmail, designId: SIMULATION_RESULTS_EMAIL_DESIGN_ALIAS, variables: simulationResultsVariables },
  {
    code: TemplatesEnum.SimulationResultsSupportEmail,
    designId: BUTTON_EMAIL_DESIGN_ALIAS,
    variables: simulationResultsSupportVariables,
  },
  {
    code: TemplatesEnum.SimulationManualReviewEmail,
    designId: SIMULATION_MANUAL_REVIEW_EMAIL_DESIGN_ALIAS,
    variables: simulationManualReviewVariables,
  },
  {
    code: TemplatesEnum.SimulationManualReviewSupportEmail,
    designId: BUTTON_EMAIL_DESIGN_ALIAS,
    variables: simulationManualReviewSupportVariables,
  },
  {
    code: TemplatesEnum.CarOnboardingPreparationNudgeEmail,
    designId: BUTTON_EMAIL_DESIGN_ALIAS,
    variables: carOnboardingPreparationNudgeVariables,
  },
] as const;

const locales = ['en', 'nl', 'fr'] as const;

const renameEyebrowToHeader = (variables: unknown): Record<string, string> | null => {
  if (!variables || typeof variables !== 'object' || Array.isArray(variables)) {
    return null;
  }
  const record = { ...(variables as Record<string, string>) };
  if (!('EYEBROW' in record)) {
    return null;
  }
  if (!('HEADER' in record) || record.HEADER === '') {
    record.HEADER = record.EYEBROW;
  }
  delete record.EYEBROW;
  return record;
};

export async function seedEmailTemplates(prisma: PrismaClient) {
  console.log('Seeding email templates...');

  for (const template of templates) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { code: template.code },
      include: { translations: true },
    });
    if (existing) {
      for (const translation of existing.translations) {
        const renamed = renameEyebrowToHeader(translation.variables);
        if (!renamed) continue;
        await prisma.emailTemplateTranslation.update({
          where: { id: translation.id },
          data: { variables: renamed },
        });
      }
      console.log(`  Skipped existing: ${template.code}`);
      continue;
    }

    await prisma.emailTemplate.create({
      data: {
        code: template.code,
        designId: template.designId,
        translations: {
          createMany: {
            data: locales.map((locale) => ({
              locale,
              variables: template.variables[locale],
            })),
          },
        },
      },
    });
    console.log(`  Seeded: ${template.code}`);
  }

  console.log('Email template seeding complete.');
}
