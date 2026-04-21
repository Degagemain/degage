---
title: Normes Euro
roles:
  - admin
---

# Normes Euro

Liste de référence des normes d'émission (ex. Euro 6), avec groupe et période de validité. Utilisées dans les car infos et les ajustements
fiscaux euro normes.

| Propriété | Description                                     |
| --------- | ----------------------------------------------- |
| Code      | Identifiant court unique de la norme.           |
| Nom       | Nom d'affichage de la norme euro.               |
| Groupe    | Libellé de groupe pour les ajustements fiscaux. |
| Actif     | Si la norme est disponible pour la sélection.   |
| Début     | Date de début de validité.                      |
| Fin       | Date de fin de validité (le cas échéant).       |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import

Utilisez **Plus → Importer** pour téléverser un fichier JSON obtenu précédemment via Exporter. Les enregistrements avec un id sont mis à jour ;
ceux sans id sont ajoutés. Chaque ligne affiche son propre statut, et un échec n'arrête pas les autres lignes.
