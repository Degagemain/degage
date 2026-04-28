---
title: Documentation
roles:
  - admin
---

# Documentation

Point central pour les textes d’aide issus du dépôt, de Notion ou des pages manuelles créées dans la zone admin ou via l’API. La liste affiche
toutes les entrées : ouvrez un titre ou **Voir** pour lire, et **Modifier** depuis la page détail ou le menu de ligne. **Nouveau** ouvre un
formulaire pour créer une documentation manuelle (titre et contenu par langue, format, public, tags, groupes). Pour les contenus dépôt ou
Notion, l’édition ne permet que la FAQ, la visibilité publique et les groupes — le titre et le texte restent synchronisés avec la source
externe.

Utilisez le bouton **Sync** pour relancer les embeddings de recherche après des mises à jour importantes de la documentation. La synchronisation
affiche les compteurs total/mis à jour/ignorés/en échec.

| Propriété      | Description                                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID externe     | Identifiant stable ; les docs dépôt utilisent `repo:{sujet}`, Notion `notion:{id-page}`, manuel souvent `manual:…`.                                                                                                |
| Source         | Origine : dépôt (dossier `docs/`), Notion (webhook) ou manuel (API).                                                                                                                                               |
| Format         | `markdown` ou `text` brut.                                                                                                                                                                                         |
| FAQ            | Si activé, l’entrée peut apparaître dans les listes FAQ filtrées par tags.                                                                                                                                         |
| Article public | Si activé, l’entrée est exposée comme article public (prévu pour une future page FAQ publique ; combinable avec le public cible et la FAQ).                                                                        |
| Public cible   | Qui peut voir la page : technical, admin, user, public (technical/admin réservés aux administrateurs). Dans la liste documentation, chaque rôle attribué apparaît comme un libellé distinct dans la colonne Rôles. |
| Tags           | Notamment `simulation_step_1` ; `simulation_step_2_approved`, `simulation_step_2_rejected`, `simulation_step_2_review` (étape résultat) ; `simulation_step_3` ; `simulation_step_4` pour cibler les FAQ.           |
| Groupes        | Libellés facultatifs pour classer les articles dans les listes et filtres (gérés dans Groupes de documentation). Le nom affiché suit la langue d’admin choisie.                                                    |
| Titre          | Par langue (anglais, néerlandais, français).                                                                                                                                                                       |
| Contenu        | Par langue ; le Markdown est pris en charge si le format est markdown.                                                                                                                                             |
| Embeddings     | Action admin pour régénérer les embeddings de recherche IA selon le contenu actuel et suivre les compteurs mis à jour/ignorés/en échec.                                                                            |

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import (en masse)

Optionnel : **Plus → Importer** fusionne beaucoup d’enregistrements à partir d’un fichier au même format JSON qu’**Exporter**. Les lignes avec
un id mettent à jour l’enregistrement existant ; les lignes sans id sont ajoutées. Chaque ligne a son propre statut ; un échec n’empêche pas les
autres.
