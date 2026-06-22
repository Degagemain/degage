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

Les admins gèrent la préparation dans la zone admin **Onboardings** (liste et détail avec onglets : infos utilisateur, infos véhicule,
assurance, valeur, finaliser).

### Infos utilisateur

Recueille les coordonnées du propriétaire : rue, commune, téléphone et attribution du propriétaire.

Cette étape est complète lorsque la rue, la commune et le téléphone sont tous renseignés.

### Infos véhicule

Recueille les caractéristiques du véhicule : marque, type de carburant, type de véhicule (ou texte libre), kilométrage, places, date de première
immatriculation, utilitaire, véhicule acheté, véhicule neuf, prix d'achat et amortissement par km.

Cette étape est complète lorsque la marque, le type de carburant et le type de véhicule sont tous définis.

### Assurance

Enregistre la compagnie d'assurance actuelle et la date de début du contrat lorsque le véhicule n'a pas été acheté.

| Statut         | Signification                                                                |
| -------------- | ---------------------------------------------------------------------------- |
| Non applicable | Le véhicule a été acheté ; il n'y a pas d'assurance existante à enregistrer. |
| Todo           | Le propriétaire doit renseigner l'assureur et la date de début du contrat.   |
| Prêt           | L'assureur et la date de début du contrat sont tous deux renseignés.         |

Le système définit le statut d'assurance automatiquement à l'enregistrement. Lorsque **Véhicule acheté** est activé, le statut devient **Non
applicable** et les champs assurance sont effacés.

Le propriétaire peut soumettre les détails d'assurance (assureur et date de début) via une mise à jour partielle tant que le statut est
**Todo**.

Cette étape est complète lorsque le statut d'assurance n'est pas **Todo**.

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

### Finaliser

Lorsque les infos utilisateur, infos véhicule, assurance et valeur sont toutes complètes, le système définit le statut de préparation sur
**Prêt** automatiquement à l'enregistrement. Un admin peut ensuite démarrer l'intégration véhicule sur l'onglet **Finaliser**.

| Statut     | Signification                                                                                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ouvert     | L'intégration est en cours ; infos utilisateur, infos véhicule, assurance et négociation de valeur ne sont pas toutes complètes.                                                                    |
| Prêt       | Infos utilisateur, infos véhicule, assurance (pas Todo) et valeur (Résolu) sont complètes. Le système définit ce statut automatiquement.                                                            |
| Verrouillé | Aucune mise à jour utilisateur n'est autorisée. Les admins peuvent toujours modifier l'enregistrement complet. Défini par un admin sur l'onglet **Finaliser** lorsque la préparation est **Prête**. |

Lorsque la préparation est **Verrouillée**, les utilisateurs ne peuvent plus mettre à jour les infos utilisateur, infos véhicule, assurance ou
la valeur tant qu'un admin ne l'a pas déverrouillée.

## Création d'un enregistrement

| Scénario              | Qui peut créer            | Body                                                                                                       |
| --------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Depuis une simulation | Tout utilisateur connecté | `{ "simulation": { "id": "<uuid>" } }` — les champs véhicule sont copiés ; l'appelant devient propriétaire |
| Enregistrement vide   | Admin uniquement          | `{}` — valeurs par défaut, sans simulation liée                                                            |

## Propriétés

| Propriété                     | Description                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Rue                           | Adresse (rue) de l'utilisateur.                                                             |
| Commune                       | Commune de l'utilisateur (code postal et localité).                                         |
| Téléphone                     | Numéro de téléphone de l'utilisateur.                                                       |
| Marque                        | Marque du véhicule.                                                                         |
| Type de carburant             | Type de carburant du véhicule.                                                              |
| Type de véhicule              | Modèle/type du véhicule dans le catalogue.                                                  |
| Type de véhicule (autre)      | Texte libre lorsqu'aucune entrée du catalogue ne convient.                                  |
| Véhicule acheté               | Indique si le véhicule a été acheté.                                                        |
| Prix d'achat                  | Prix d'achat du véhicule.                                                                   |
| Valeur du véhicule            | Valeur actuelle estimée du véhicule (proposée par l'admin).                                 |
| Contre-proposition            | Valeur alternative proposée par le propriétaire.                                            |
| Message de contre-proposition | Explication optionnelle de la contre-proposition.                                           |
| Statut de valeur              | Progression de la négociation sur la valeur du véhicule.                                    |
| Assureur                      | Compagnie d'assurance actuelle du véhicule.                                                 |
| Début du contrat d'assurance  | Date de début du contrat d'assurance.                                                       |
| Statut d'assurance            | Progression du sous-processus assurance.                                                    |
| Amortissement par km          | Coût d'amortissement estimé par kilomètre parcouru.                                         |
| Véhicule neuf                 | Indique si le véhicule est neuf.                                                            |
| Kilométrage                   | Kilométrage actuel.                                                                         |
| Première immatriculation      | Date de première immatriculation.                                                           |
| Places                        | Nombre de places assises.                                                                   |
| Utilitaire                    | Indique si le véhicule est classé comme utilitaire.                                         |
| Propriétaire                  | Utilisateur de la plateforme propriétaire de cet enregistrement (optionnel pour l'instant). |
| Simulation                    | Simulation associée, le cas échéant.                                                        |
| Statut de préparation         | Suit la progression : Ouvert, Prêt ou Verrouillé.                                           |
