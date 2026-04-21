---
title: Marques
roles:
  - admin
---

# Marques

Liste de référence des marques de véhicules (ex. Tesla, Volkswagen), utilisée dans la simulation, les types de véhicules, les car infos et les
estimations de prix.

| Propriété | Description                                    |
| --------- | ---------------------------------------------- |
| Code      | Identifiant court unique de la marque.         |
| Nom       | Nom d'affichage de la marque.                  |
| Actif     | Si la marque est disponible pour la sélection. |

Utilisez **Nouveau** à côté de la recherche pour ajouter une marque, ou ouvrez une marque depuis son nom ou l’action **Modifier** pour la mettre
à jour (y compris les noms par langue).

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import

Utilisez **Plus → Importer** pour téléverser un fichier JSON obtenu précédemment via Exporter. Les enregistrements avec un id sont mis à jour ;
ceux sans id sont ajoutés. Chaque ligne affiche son propre statut, et un échec n'arrête pas les autres lignes.
