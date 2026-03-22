---
title: Simulations
roles:
  - admin
---

# Simulations

Cette page regroupe :

- Le fonctionnement de la logique de simulation
- Les tables utilisees par le moteur
- Les informations visibles dans la liste des simulations

## Objectif

La simulation estime si un vehicule correspond aux regles de la plateforme et aux attentes tarifaires.

Elle combine :

- Des controles d'eligibilite (limites de kilometrage et d'age)
- Des estimations financieres (valeur, taxe, assurance, entretien, controle technique, carburant, depreciation)
- Un score qualite (ecoscore, kilometrage, age et contexte de demande)
- Des regles de categorie finale (A, B, tarif plus eleve, ou refus)
- Un plafond optionnel de **prix max vehicule** sur le hub : lorsqu'il est defini, une execution qui se serait terminee en categorie A, B ou
  tarif plus eleve peut devenir **Manual review** (voir ci-dessous)

Chaque execution renvoie un resultat et une liste detaillee d'etapes/messages pour expliquer la decision.

## Principaux champs saisis

La simulation utilise notamment :

- Marque, type de carburant, type de vehicule (ou "autre")
- Neuf/occasion, premiere immatriculation, kilometrage, nombre de places, indicateur van
- Prix d'achat (vehicule neuf)
- Commune et km proprietaire prevus par an

## Flux de simulation

### 1) Controles initiaux

- Pour les vehicules d'occasion, le moteur verifie kilometrage maximal et age maximal.
- Les seuils viennent de la configuration du hub selectionne.
- Si un controle echoue, la simulation s'arrete avec **Not OK**.

### 2) Estimation de la valeur du vehicule

- Occasion : estimation d'une plage de valeur puis conversion en valeur courante estimee.
- Neuf : le prix d'achat est utilise comme valeur estimee.

### 3) Estimation du profil technique

- Le moteur estime les valeurs techniques necessaires ensuite : consommation, cylindree (cc), CO2, ecoscore et norme euro.

### 4) Estimation de la taxe annuelle

- Electrique : tarif forfaitaire selon region fiscale et date de premiere immatriculation.
- Non electrique :
  - Tarif de base selon region/date/cc
  - Ajustement CO2
  - Ajustement norme euro (specifique diesel si applicable)
- Pour les anciennes immatriculations, le facteur historique de majoration est applique.

Contexte reglementaire CO2 :
[Taxe de circulation pour voitures particulieres](https://www.vlaanderen.be/belastingen-en-begroting/vlaamse-belastingen/verkeersbelastingen/verkeersbelastingen-voor-personenwagens).

### 5) Estimation de l'assurance annuelle

- L'assurance est calculee via le benchmark le plus recent correspondant a l'annee de simulation et a la valeur du vehicule.
- Formule : montant fixe de base + pourcentage variable sur la valeur du vehicule.

### 6) Construction du cout au km

La simulation calcule ensuite :

- Cout de controle technique par an
- Cout d'entretien par an
- Benchmarks km partages (min/moy/max) selon km proprietaire
- Kilometrage annuel total estime
- Cout annuel fixe
- Cout carburant par km
- Cout de depreciation par km
- Cout final au km (arrondi)

### 7) Points de qualite

Les points sont attribues selon les seuils du hub :

- Seuil ecoscore
- Seuil kilometrage
- Seuil age du vehicule

Si le score est faible, des regles de correction supplementaires sont appliquees (bandes ecoscore, kilometrage, age, et bonus commune a forte
demande).

Si le score final reste sous le minimum, le resultat devient **Not OK**.

### 8) Attribution du resultat final

Si les criteres qualite sont valides, le moteur applique les regles de categorie :

- **Category A** : profil cout au km plus bas (avec regles de repli dans certains cas)
- **Category B** : regle alternative pour vehicules avec plus de places
- **Higher rate** : regle pour vans
- **Not OK** : si les criteres de prix ne sont pas atteints

**Manual review pour valeur elevee (parametrage hub) :** Le hub peut definir un **prix maximum** pour l'acceptation automatique. Si ce plafond
est renseigne et que la **valeur estimee** (occasion) ou le **prix d'achat** (neuf) le **depasse**, le moteur effectue quand meme tout le
calcul. Ce n'est que si le resultat **aurait ete** **Category A**, **Category B** ou **Higher rate** que le moteur le remplace par **Manual
review**. Un message d'etape indique quelle categorie ou quel tarif aurait ete attribue. Si le resultat **aurait ete** **Not OK**, le plafond de
prix **ne modifie pas** l'issue. Voir [Hubs](hubs.md) pour le detail et la configuration.

## Codes de resultat

| Code              | Signification                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Category A**    | Le vehicule correspond au profil standard de cout km plus bas.                                                                                                                                                                                                                                                                             |
| **Category B**    | Le vehicule correspond a une regle de categorie alternative (souvent plus de places).                                                                                                                                                                                                                                                      |
| **Higher rate**   | Le vehicule est accepte selon la logique de tarif plus eleve (cas van).                                                                                                                                                                                                                                                                    |
| **Not OK**        | Le vehicule echoue sur eligibilite, qualite ou criteres de prix.                                                                                                                                                                                                                                                                           |
| **Manual review** | Soit : (1) **Valeur vehicule elevee** — le plafond prix du hub est depasse et les regles auraient accepte le vehicule (**Category A**, **Category B** ou **Higher rate**) ; voir les etapes pour la categorie prevue. Soit : (2) **Repli technique** — l'execution n'a pas pu aller au bout (references manquantes, erreur runtime, etc.). |

## Tables utilisees par la simulation

La simulation lit des tables operationnelles et de reference de l'administration.

| Table/theme utilise           | Pourquoi utilise dans la simulation                                       | Documentation admin liee                                          |
| ----------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Communes                      | Point de depart pour le contexte geographique et le flag de demande.      | [Towns](towns.md)                                                 |
| Hubs                          | Fournit la plupart des seuils et parametres de cout annuel fixe.          | [Hubs](hubs.md)                                                   |
| Hub benchmarks                | Trouve le benchmark le plus proche pour estimer km partages/total annuel. | [Hub benchmarks](hub-benchmarks.md)                               |
| Provinces                     | Determine la province a partir de la commune.                             | [Provinces](provinces.md)                                         |
| Regions fiscales              | Determine les regles de taxe par region.                                  | [Fiscal regions](fiscal-regions.md)                               |
| Types de carburant            | Fournit la logique de carburant et le prix unitaire.                      | [Fuel types](fuel-types.md)                                       |
| Types de vehicule             | Peut fournir l'ecoscore utilise pour le score qualite.                    | [Car types](car-types.md)                                         |
| Car infos                     | Source des valeurs techniques estimees du vehicule.                       | [Car infos](car-infos.md)                                         |
| Car price estimates           | Source de l'estimation de valeur de marche.                               | [Car price estimates](car-price-estimates.md)                     |
| Normes euro                   | Necessaires pour l'ajustement de taxe non electrique.                     | [Euro norms](euro-norms.md)                                       |
| Car tax base rates            | Tarifs de base de taxe annuelle par region/date/cc.                       | [Car tax base rates](car-tax-base-rates.md)                       |
| Car tax flat rates            | Tarifs forfaitaires de taxe (notamment electrique).                       | [Car tax flat rates](car-tax-flat-rates.md)                       |
| Car tax euro norm adjustments | Ajustements de taxe par groupe de norme euro.                             | [Car tax euro norm adjustments](car-tax-euro-norm-adjustments.md) |
| Insurance price benchmarks    | Benchmarks assurance : base + part variable.                              | [Insurance price benchmarks](insurance-price-benchmarks.md)       |

## Liste des simulations

La liste affiche les executions : commune, resultat et donnees vehicule saisies. Ouvrir une ligne pour voir le resultat detaille et les messages
d'etapes.

| Propriété                | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| Commune                  | Commune sélectionnée pour l'exécution (le cas échéant). |
| Code résultat            | Résultat global (ex. Not OK, Manual review).            |
| Marque                   | Marque saisie.                                          |
| Type de carburant        | Type de carburant saisi.                                |
| Type de véhicule         | Type ou description « Autre ».                          |
| Kilométrage              | Kilométrage en km.                                      |
| Places                   | Nombre de places.                                       |
| Première immatriculation | Date de première immatriculation.                       |
| Type autre               | Description personnalisée lorsque « Autre » est choisi. |

## Conseils pour les admins

- Garder les tables de reference completes et a jour avant les batchs de simulation.
- Si beaucoup de runs renvoient **Manual review**, verifier si le **prix max vehicule** du hub en est la cause (cas valeur elevee : une etape
  l'explique) ; sinon verifier d'abord les benchmarks et autres references manquants ou invalides.
- Revoir regulierement les seuils des hubs : ils influencent fortement l'acceptation et la categorie finale.
