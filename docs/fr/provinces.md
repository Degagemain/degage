---
title: Provinces
roles:
  - admin
---

# Provinces

Liste de référence des provinces, chacune liée à une région fiscale. Utilisée pour grouper les communes et pour la logique fiscale/régionale.

| Propriété      | Description                                          |
| -------------- | ---------------------------------------------------- |
| Nom            | Nom d'affichage de la province.                      |
| Région fiscale | La région fiscale à laquelle la province appartient. |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import

Utilisez **Plus → Importer** pour téléverser un fichier JSON obtenu précédemment via Exporter. Les enregistrements avec un id sont mis à jour ;
ceux sans id sont ajoutés. Chaque ligne affiche son propre statut, et un échec n'arrête pas les autres lignes.
