---
title: Surcharges de traduction
roles:
  - admin
---

# Surcharges de traduction

Utilisez les surcharges de traduction pour adapter les textes de l'interface depuis la zone d'administration. Les surcharges sont des
changements temporaires en base de données.

| Propriété | Description                                            |
| --------- | ------------------------------------------------------ |
| Chemin    | Emplacement du texte dans le catalogue de traductions. |
| Original  | Texte actuel provenant des fichiers de messages.       |
| Surcharge | Texte de remplacement affiché dans l'application.      |
| Langue    | Langue à laquelle la surcharge s'applique.             |

La recherche porte sur les valeurs des textes, pas sur les chemins. Utilisez **Télécharger le patch** lorsque les surcharges sont prêtes à être
traitées par les développeurs. La liste affiche la valeur dans votre langue actuelle. Ouvrez une clé pour consulter le texte original et
modifier les surcharges avec les onglets de langue.

Sur les pages publiques (accueil, simulation, onboarding, tableau de bord, aide, compte), vous pouvez ajouter un lien web ou e-mail dans une
phrase. Mettez les mots visibles entre crochets, puis l'adresse entre parenthèses juste après. Les adresses web commencent par http ou https ;
les adresses e-mail commencent par mailto. L'éditeur de surcharge montre un exemple. Cela ne s'applique pas aux libellés courts comme les noms
de boutons.
