---
title: Onboardings
roles:
  - admin
---

# Onboardings

L'intégration véhicule est un processus en plusieurs étapes qui collecte les informations du véhicule et de l'utilisateur avant qu'une voiture
puisse rejoindre pleinement la plateforme.

## Préparation

Pendant la préparation, le système recueille les coordonnées et les caractéristiques du véhicule en étapes distinctes. Un statut de préparation
indique si les informations requises sont complètes et si de nouvelles modifications sont autorisées.

Les admins gèrent la préparation dans la zone admin **Onboardings** (liste et détail avec onglets : propriétaire, infos utilisateur, infos
véhicule, assurance, assistance routière, valeur, date de début du partage, finaliser). Après la préparation, un second menu **Intégration**
regroupe les étapes suivantes.

### Propriétaire

Attribue le propriétaire de l'intégration véhicule et indique s'il a lié son compte Dégage legacy (Play connector).

Cette étape est complète lorsque le propriétaire a configuré un enregistrement Play connector.

### Session d'info

Le propriétaire s'inscrit à une infosession Degapp à venir dans le parcours d'onboarding public.

| Statut  | Signification                                                            |
| ------- | ------------------------------------------------------------------------ |
| Todo    | Le propriétaire n'est pas encore inscrit à une session d'info.           |
| Inscrit | Le propriétaire est inscrit ; en attente de confirmation de présence.    |
| Complet | Un admin a confirmé que le propriétaire a assisté à la session inscrite. |

Le propriétaire ne peut être inscrit qu'à une seule session à la fois. Pour en choisir une autre, il doit d'abord se désinscrire.

L'inscription débloque les étapes de préparation suivantes dans le parcours public. La confirmation de présence par un admin reste nécessaire
avant que l'étape session d'info soit marquée complète et que la préparation puisse être finalisée.

Cette étape est complète lorsque le statut de session d'info est **Complet**.

### Infos utilisateur

Recueille les coordonnées du propriétaire : rue, numéro, commune et téléphone.

Cette étape est complète lorsque la rue, le numéro, la commune et le téléphone sont tous renseignés.

### Infos véhicule

Recueille les caractéristiques du véhicule : marque, type de carburant, type de véhicule (ou texte libre), kilométrage, places, date de première
immatriculation, utilitaire, véhicule acheté, véhicule neuf, prix d'achat, amortissement par km, scans du certificat d'immatriculation (recto et
verso), certificat de contrôle technique et formulaire rose.

Les images de documents téléversées sont vérifiées automatiquement avant d'être enregistrées. Si une photo est floue ou ne correspond pas au
type de document attendu, le téléversement est refusé et l'utilisateur est invité à téléverser une photo nette. Le recto du certificat
d'immatriculation peut aussi préremplir le VIN, la plaque d'immatriculation et la date de première immatriculation lorsque ces champs sont
encore vides.

Cette étape est complète lorsque la marque, le type de carburant et le type de véhicule sont tous définis, et que tous les documents requis pour
la situation du véhicule sont téléversés : certificat d'immatriculation recto et verso lorsque le véhicule n'a pas été acheté ; certificat de
contrôle technique en plus lorsque le véhicule a plus de quatre ans ; formulaire rose lorsque le véhicule a été acheté et n'est pas neuf ; aucun
document lorsque le véhicule a été acheté et est neuf.

### Assurance

Indique si le véhicule a déjà un contrat d'assurance et, le cas échéant, enregistre la compagnie d'assurance actuelle et la date de début du
contrat.

| Propriété                | Description                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| A un contrat d'assurance | Indique si le propriétaire a déjà un contrat d'assurance pour ce véhicule.                                        |
| Assureur                 | Compagnie d'assurance actuelle (affichée lorsque a un contrat d'assurance est activé).                            |
| Début du contrat         | Date de début du contrat d'assurance actuel (lorsque a un contrat d'assurance est activé).                        |
| Hausse de tarif annoncée | Indique si l'assureur a annoncé une hausse de prime (affiché lorsque le contrat a commencé il y a moins d'un an). |

| Statut         | Signification                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Non applicable | Le véhicule n'a pas de contrat d'assurance existant à enregistrer ; les champs assurance ne sont pas requis. |
| Todo           | A un contrat d'assurance est activé ; les détails d'assurance peuvent être renseignés plus tard.             |
| Prêt           | A un contrat d'assurance est activé et les détails d'assurance sont renseignés.                              |

Le système définit le statut d'assurance automatiquement à l'enregistrement. Lorsque **A un contrat d'assurance** est désactivé, le statut
devient **Non applicable** et les champs assurance sont effacés.

Le propriétaire peut mettre à jour les détails d'assurance via une mise à jour partielle tant que le statut est **Todo**. Les détails
d'assurance ne sont pas requis dans la même soumission que le drapeau.

Cette étape est complète lorsque le statut d'assurance n'est pas **Todo**.

### Assistance routière

Indique si le véhicule a déjà une assistance routière. Choisir un plan souhaité dans le catalogue n'est actuellement pas requis.

| Propriété                                 | Description                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A un plan d'assistance existant           | Indique si le véhicule a déjà une assistance routière (pour un véhicule neuf acheté, cela peut être inclus). |
| Nom du plan d'assistance existant         | Nom du plan d'assistance actuel (lorsque a un plan d'assistance existant est activé).                        |
| Date de fin du plan d'assistance existant | Date de fin du plan d'assistance actuel (lorsque a un plan d'assistance existant est activé).                |

| Statut | Signification                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------- |
| Todo   | A un plan d'assistance existant est activé, mais le nom ou la date de fin du plan existant manque. |
| Prêt   | Les détails du plan existant sont complets le cas échéant. Un plan souhaité n'est pas obligatoire. |

Le système définit le statut automatiquement à l'enregistrement. Lorsque **A un plan d'assistance existant** est désactivé, le nom et la date de
fin du plan existant sont effacés.

Le propriétaire peut mettre à jour les détails via une mise à jour partielle tant que le statut est **Todo**.

Cette étape est complète lorsque le statut d'assistance routière n'est pas **Todo**.

### Valeur

Négocie la valeur actuelle estimée du véhicule entre l'admin et le propriétaire.

| Statut   | Signification                                                                          |
| -------- | -------------------------------------------------------------------------------------- |
| Todo     | État initial ; en attente d'une proposition de valeur par l'admin.                     |
| Proposal | L'admin a proposé une valeur ; le propriétaire peut contre-proposer ou accepter.       |
| Counter  | Le propriétaire a soumis une contre-proposition ; en attente de la réponse de l'admin. |
| Resolved | Le propriétaire a accepté ; le sous-processus valeur est terminé.                      |

Lorsqu'un admin modifie la valeur alors que le statut est **Todo** ou **Counter**, le statut passe automatiquement à **Proposal**.

Le propriétaire peut soumettre une contre-proposition (valeur et message optionnel) lorsque le statut est **Proposal** ; le statut devient
**Counter**. Le propriétaire peut accepter lorsque le statut est **Proposal** ; le statut devient **Resolved**.

Les admins peuvent outrepasser l'accord sur l'onglet valeur lorsque le propriétaire a explicitement accepté en dehors du flux normal dans
l'application.

Cette étape est complète lorsque le statut de valeur est **Resolved**.

### Stickers voiture

Le propriétaire peut choisir des designs de stickers supplémentaires dans le catalogue pendant le flux d'intégration public. Les stickers
supplémentaires sont facultatifs. Les stickers toujours inclus sont affichés comme pré-sélectionnés et ne peuvent pas être retirés ; ils ne sont
pas enregistrés sur l'enregistrement d'intégration.

| Propriété        | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| Stickers voiture | Designs de stickers supplémentaires sélectionnés et enregistrés par le propriétaire. |

Cette étape est toujours complète ; les stickers supplémentaires sont facultatifs.

### Nom du véhicule et date de début du partage

Choisit un nom unique pour le véhicule et quand il devient disponible pour le partage. C'est la dernière étape de préparation. Le nom compte
entre 3 et 13 caractères, utilise uniquement des lettres et des chiffres (sans caractères spéciaux ni tirets) et ne doit pas déjà exister dans
la flotte Play legacy ni sur un autre onboarding. La date de début est toujours le premier du mois. Le mois le plus tôt autorisé dépend des
détails d'assurance (ou du premier du mois en cours lorsqu'il n'y a pas de contrat d'assurance existant). Les assureurs en démarrage immédiat
ignorent le délai d'attente habituel : le mois le plus tôt est le premier de ce mois ou du mois suivant. Le mois le plus tard autorisé est 18
mois à partir d'aujourd'hui.

| Propriété             | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| Nom du véhicule       | Nom unique du véhicule (3–13 caractères, lettres et chiffres uniquement). |
| Date de début partage | Premier jour du mois auquel le partage est prévu de commencer.            |

Cette étape ne se déverrouille qu'après que l'étape assurance est complète. Modifier les détails d'assurance qui affectent la date la plus tôt
efface la date de début choisie afin que le propriétaire doive la choisir à nouveau.

Cette étape est complète lorsqu'un nom de véhicule valide et une date de début sont définis.

### Finaliser

Lorsque Play connector, session d'info, infos utilisateur, infos véhicule, assurance, assistance routière, valeur, stickers voiture, date de
début du partage et confirmation du propriétaire sont toutes complètes, le système définit le statut de préparation sur **Prêt** automatiquement
à l'enregistrement. Un admin peut ensuite verrouiller la préparation sur l'onglet **Finaliser**.

Le propriétaire peut confirmer la préparation une fois les autres étapes terminées, même si la session d'info est seulement **Inscrit** (pas
encore confirmée par un admin). Après confirmation, ses données de préparation deviennent en lecture seule. La préparation ne passe à **Prêt**
qu'après cette confirmation et lorsque la session d'info est **Complet** (avec les autres exigences).

| Statut     | Signification                                                                                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ouvert     | L'intégration est en cours ; les étapes de préparation (y compris la confirmation du propriétaire) ne sont pas toutes complètes.                                                                                                                          |
| Prêt       | Play connector, session d'info (Complet), infos utilisateur, infos véhicule, assurance (pas Todo), valeur (Résolu), stickers voiture, date de début et confirmation du propriétaire sont complètes. Le système définit ce statut automatiquement.         |
| Verrouillé | Aucune mise à jour utilisateur n'est autorisée. Les admins peuvent toujours modifier l'enregistrement complet. Verrouiller avec **Verrouiller la préparation** sur **Finaliser** lorsque **Prête** ; déverrouiller avec **Déverrouiller la préparation**. |

Lorsque la préparation est **Verrouillée**, ou après confirmation du propriétaire, les utilisateurs ne peuvent plus mettre à jour les infos
utilisateur, infos véhicule, assurance ou la valeur. Les admins peuvent effacer la confirmation du propriétaire depuis **Finaliser** lorsque la
préparation n'est pas verrouillée.

## Intégration

Après la préparation, les admins gèrent l'intégration elle-même dans un second menu. Cet onglet **Clôture administrative** permet de
synchroniser l'**Autofiche** (la fiche voiture dans Play). La synchronisation n'est pas disponible tant que le propriétaire n'a pas lié son
compte Play. Si la préparation n'est pas encore verrouillée, l'admin doit d'abord confirmer.

## Création d'un enregistrement

| Scénario              | Qui peut créer            | Body                                                                                                       |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Depuis une simulation | Tout utilisateur connecté | `{ "simulation": { "id": "<uuid>" } }` — les champs véhicule sont copiés ; l'appelant devient propriétaire |
| Enregistrement vide   | Admin uniquement          | `{}` — valeurs par défaut, sans simulation liée                                                            |

## Propriétés

| Propriété                            | Description                                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Rue                                  | Adresse (rue) de l'utilisateur.                                                                                                        |
| Numéro                               | Numéro de maison de l'utilisateur.                                                                                                     |
| Commune                              | Commune de l'utilisateur (code postal et localité).                                                                                    |
| Téléphone                            | Numéro de téléphone de l'utilisateur.                                                                                                  |
| Marque                               | Marque du véhicule.                                                                                                                    |
| Type de carburant                    | Type de carburant du véhicule.                                                                                                         |
| Type de véhicule                     | Modèle/type du véhicule dans le catalogue.                                                                                             |
| Type de véhicule (autre)             | Texte libre lorsqu'aucune entrée du catalogue ne convient.                                                                             |
| Véhicule acheté                      | Indique si le véhicule a été acheté.                                                                                                   |
| Prix d'achat                         | Prix d'achat du véhicule.                                                                                                              |
| Certificat d'immatriculation (recto) | Scan ou photo du recto du certificat d'immatriculation.                                                                                |
| Certificat d'immatriculation (verso) | Scan ou photo du verso du certificat d'immatriculation.                                                                                |
| Certificat de contrôle technique     | Rapport de contrôle technique valide (requis pour les véhicules de plus de 4 ans).                                                     |
| Formulaire rose                      | Formulaire de cession du véhicule (formulaire rose) pour les véhicules achetés d'occasion.                                             |
| Valeur du véhicule                   | Valeur actuelle estimée du véhicule (proposée par l'admin).                                                                            |
| Contre-proposition                   | Valeur alternative proposée par le propriétaire.                                                                                       |
| Message de contre-proposition        | Explication optionnelle de la contre-proposition.                                                                                      |
| Statut de valeur                     | Progression de la négociation sur la valeur du véhicule.                                                                               |
| Assureur                             | Compagnie d'assurance actuelle du véhicule.                                                                                            |
| Début du contrat d'assurance         | Date de début du contrat d'assurance.                                                                                                  |
| Statut d'assurance                   | Progression du sous-processus assurance.                                                                                               |
| Nom du plan d'assistance existant    | Nom du plan d'assistance actuel, lorsque le propriétaire a déjà une couverture.                                                        |
| Amortissement par km                 | Coût d'amortissement estimé par kilomètre parcouru.                                                                                    |
| Véhicule neuf                        | Indique si le véhicule est neuf.                                                                                                       |
| Kilométrage                          | Kilométrage actuel.                                                                                                                    |
| Première immatriculation             | Date de première immatriculation.                                                                                                      |
| Places                               | Nombre de places assises.                                                                                                              |
| Utilitaire                           | Indique si le véhicule est classé comme utilitaire.                                                                                    |
| Propriétaire                         | Utilisateur de la plateforme propriétaire de cet enregistrement (optionnel pour l'instant).                                            |
| Propriétaire Play connector          | Indique si le propriétaire a lié un compte Play connector (Oui/Non).                                                                   |
| Date session d'info                  | Date prévue de la session d'info inscrite.                                                                                             |
| ID PC session d'info                 | Identifiant Play connector de la session d'info inscrite.                                                                              |
| Autofiche                            | Identifiant Play de la fiche voiture synchronisée. Les admins la synchronisent depuis Clôture administrative.                          |
| Statut session d'info                | Progression du sous-processus session d'info.                                                                                          |
| Simulation                           | Simulation associée, le cas échéant.                                                                                                   |
| Préparation confirmée le             | Date et heure auxquelles le propriétaire a confirmé les données de préparation.                                                        |
| Préparation                          | Progression discrète des étapes de préparation ; chaque bloc est coloré selon le statut, affiche le nom au survol et ouvre cet onglet. |
| Statut de préparation                | Suit la progression : Ouvert, Prêt ou Verrouillé.                                                                                      |
