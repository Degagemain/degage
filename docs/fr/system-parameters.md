---
title: Paramètres système
roles:
  - technical
  - admin
---

# System Parameters

Valeurs configurables qui pilotent les règles métier et les prompts de l'assistant. Seule la valeur peut être modifiée dans l'admin ; code,
catégorie, type et nom sont fixes.

| Propriété | Description                                                        |
| --------- | ------------------------------------------------------------------ |
| Code      | Identifiant unique (ex. maxAgeYears, maxKm).                       |
| Catégorie | Regroupement (ex. simulation ou assistant) pour le filtrage.       |
| Nom       | Nom d'affichage (traduisible, lecture seule).                      |
| Type      | Comment la valeur est stockée : nombre, plage, euronorme ou texte. |
| Valeur    | La ou les valeur(s) éditables selon le type.                       |

Paramètres assistant :

| Code                       | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `assistantBasePromptChat`  | Prompt de base de l'assistant de documentation dans le widget de chat.               |
| `assistantBasePromptEmail` | Prompt de base de l'assistant de documentation pour les e-mails de support entrants. |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.
