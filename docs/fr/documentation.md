---
title: Documentation
roles:
  - admin
---

# Documentation

Point central pour les textes d’aide issus du dépôt, de Notion ou des enregistrements manuels (via l’API). La zone admin liste les entrées ; les
écrans de création et d’édition sont masqués pour l’instant.

Utilisez le bouton **Sync** pour relancer les embeddings de recherche après des mises à jour importantes de la documentation. La synchronisation
affiche les compteurs total/mis à jour/ignorés/en échec.

| Propriété    | Description                                                                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID externe   | Identifiant stable ; les docs dépôt utilisent `repo:{sujet}`, Notion `notion:{id-page}`, manuel souvent `manual:…`.                                                                                                |
| Source       | Origine : dépôt (dossier `docs/`), Notion (webhook) ou manuel (API).                                                                                                                                               |
| Format       | `markdown` ou `text` brut.                                                                                                                                                                                         |
| FAQ          | Si activé, l’entrée peut apparaître dans les listes FAQ filtrées par tags.                                                                                                                                         |
| Public cible | Qui peut voir la page : technical, admin, user, public (technical/admin réservés aux administrateurs). Dans la liste documentation, chaque rôle attribué apparaît comme un libellé distinct dans la colonne Rôles. |
| Tags         | Notamment `simulation_step_1` ; `simulation_step_2_approved`, `simulation_step_2_rejected`, `simulation_step_2_review` (étape résultat) ; `simulation_step_3` ; `simulation_step_4` pour cibler les FAQ.           |
| Titre        | Par langue (anglais, néerlandais, français).                                                                                                                                                                       |
| Contenu      | Par langue ; le Markdown est pris en charge si le format est markdown.                                                                                                                                             |
| Embeddings   | Action admin pour régénérer les embeddings de recherche IA selon le contenu actuel et suivre les compteurs mis à jour/ignorés/en échec.                                                                            |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.
