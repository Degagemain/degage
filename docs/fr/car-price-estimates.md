---
title: Estimations de prix
roles:
  - admin
---

# Car Price Estimates

Fourchettes de valeur estimées par marque, type de carburant, type de véhicule et année. Utilisées à l'étape prix de la simulation et en
référence interne.

| Propriété        | Description                               |
| ---------------- | ----------------------------------------- |
| Marque           | Marque (via type de véhicule).            |
| Carburant        | Type de carburant (via type de véhicule). |
| Type véhicule    | Type de véhicule.                         |
| Année            | Année du modèle.                          |
| Année estimation | Année d'application de l'estimation.      |
| Prix             | Prix estimé.                              |
| Min fourchette   | Minimum de la fourchette.                 |
| Max fourchette   | Maximum de la fourchette.                 |
| Remarques        | Notes optionnelles.                       |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import

Utilisez **Plus → Importer** pour téléverser un fichier JSON obtenu précédemment via Exporter. Les enregistrements avec un id sont mis à jour ;
ceux sans id sont ajoutés. Chaque ligne affiche son propre statut, et un échec n'arrête pas les autres lignes.
