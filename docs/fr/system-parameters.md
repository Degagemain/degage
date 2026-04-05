---
title: Paramètres système
roles:
  - technical
  - admin
---

# System Parameters

Valeurs configurables qui pilotent les règles métier (ex. limites de simulation). Seule la valeur peut être modifiée dans l'admin ; code,
catégorie, type et nom sont fixes.

| Propriété | Description                                                 |
| --------- | ----------------------------------------------------------- |
| Code      | Identifiant unique (ex. maxAgeYears, maxKm).                |
| Catégorie | Regroupement (ex. simulation) pour le filtrage.             |
| Nom       | Nom d'affichage (traduisible, lecture seule).               |
| Type      | Comment la valeur est stockée : nombre, plage ou euronorme. |
| Valeur    | La ou les valeur(s) éditables selon le type.                |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.
