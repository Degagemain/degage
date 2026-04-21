---
title: Normes Euro (taxe auto)
roles:
  - admin
---

# Fiscal Tax Euro Norms

Ajustements fiscaux par classe d'émission (groupe euro norme) et type de carburant par région fiscale. Utilisés avec les taux de base et fixes
dans le calcul de la taxe véhicule.

| Propriété         | Description                                        |
| ----------------- | -------------------------------------------------- |
| Région fiscale    | La région à laquelle cet ajustement s'applique.    |
| Groupe euro norme | Groupe d'émission (ex. Euro 6).                    |
| Ajustement défaut | Facteur d'ajustement pour le carburant par défaut. |
| Ajustement diesel | Facteur d'ajustement pour le diesel.               |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import

Utilisez **Plus → Importer** pour téléverser un fichier JSON obtenu précédemment via Exporter. Les enregistrements avec un id sont mis à jour ;
ceux sans id sont ajoutés. Chaque ligne affiche son propre statut, et un échec n'arrête pas les autres lignes.
