---
title: Types de Carburant
roles:
  - admin
---

# Types de Carburant

Liste de référence des types de carburant (essence, diesel, électrique, etc.), utilisée dans la simulation, les car infos et les estimations de
prix.

| Propriété        | Description                                    |
| ---------------- | ---------------------------------------------- |
| Code             | Identifiant court unique du type de carburant. |
| Nom              | Nom d'affichage du type de carburant.          |
| Actif            | Si le type est disponible pour la sélection.   |
| Prix par l/kWh   | Valeur utilisée dans les calculs.              |
| Contribution CO₂ | Valeur utilisée dans les calculs.              |

Utilisez **Nouveau** à côté de la recherche pour ajouter un type de carburant, ou ouvrez-le depuis son nom ou l’action **Modifier** pour le
mettre à jour (y compris les noms par langue).

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import

Utilisez **Plus → Importer** pour téléverser un fichier JSON obtenu précédemment via Exporter. Les enregistrements avec un id sont mis à jour ;
ceux sans id sont ajoutés. Chaque ligne affiche son propre statut, et un échec n'arrête pas les autres lignes.
