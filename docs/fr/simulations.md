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
- Des regles de categorie finale (A, B, ou refus)
- Un plafond optionnel de **prix max vehicule** sur le hub : lorsqu'il est defini, une execution qui se serait terminee en categorie A ou B peut
  devenir **Manual review** (voir ci-dessous)

Chaque execution renvoie un resultat et une liste detaillee d'etapes/messages pour expliquer la decision.

## Principaux champs saisis

La simulation utilise notamment :

- Marque, type de carburant, type de vehicule (ou "autre")
- Neuf/occasion, premiere immatriculation, kilometrage (compteur a l'achat pour un vehicule neuf), nombre de places, indicateur van
- Prix d'achat (vehicule neuf)
- Commune et km proprietaire prevus par an

## Flux de simulation

### 1) Controles initiaux

- Toutes les executions verifient le kilometrage maximal (odometre, y compris pour un achat recent).
- Les vehicules d'occasion sont aussi verifies sur l'age maximal.
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
- Scenarios hub de km partages (min/moy/max)
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
- **Category B** : regle alternative pour vehicules avec plus de places, et repli pour les vans
- **Not OK** : si les criteres de prix ne sont pas atteints

**Manual review pour valeur elevee (parametrage hub) :** Le hub peut definir un **prix maximum** pour l'acceptation automatique. Si ce plafond
est renseigne et que la **valeur estimee** (occasion) ou le **prix d'achat** (neuf) le **depasse**, le moteur effectue quand meme tout le
calcul. Ce n'est que si le resultat **aurait ete** **Category A** ou **Category B** que le moteur le remplace par **Manual review**. Un message
d'etape indique quelle categorie aurait ete attribuee. Si le resultat **aurait ete** **Not OK**, le plafond de prix **ne modifie pas** l'issue.
Voir [Hubs](hubs.md) pour le detail et la configuration.

## Codes de resultat

| Code              | Signification                                                                                                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category A**    | Le vehicule correspond au profil standard de cout km plus bas.                                                                                                                                                                                                                                                            |
| **Category B**    | Le vehicule correspond a la regle de categorie alternative (plus de places, ou van).                                                                                                                                                                                                                                      |
| **Not OK**        | Le vehicule echoue sur eligibilite, qualite ou criteres de prix.                                                                                                                                                                                                                                                          |
| **Manual review** | Soit : (1) **Valeur vehicule elevee** — le plafond prix du hub est depasse et les regles auraient accepte le vehicule (**Category A** ou **Category B**) ; voir les etapes pour la categorie prevue. Soit : (2) **Repli technique** — l'execution n'a pas pu aller au bout (references manquantes, erreur runtime, etc.). |

## Tables utilisees par la simulation

La simulation lit des tables operationnelles et de reference de l'administration.

| Table/theme utilise           | Pourquoi utilise dans la simulation                                             | Documentation admin liee                                          |
| ----------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Communes                      | Point de depart pour le contexte geographique et le flag de demande.            | [Towns](towns.md)                                                 |
| Hubs                          | Fournit la plupart des seuils, couts annuels fixes et scenarios de km partages. | [Hubs](hubs.md)                                                   |
| Provinces                     | Determine la province a partir de la commune.                                   | [Provinces](provinces.md)                                         |
| Regions fiscales              | Determine les regles de taxe par region.                                        | [Fiscal regions](fiscal-regions.md)                               |
| Types de carburant            | Fournit la logique de carburant et le prix unitaire.                            | [Fuel types](fuel-types.md)                                       |
| Types de vehicule             | Peut fournir l'ecoscore utilise pour le score qualite.                          | [Car types](car-types.md)                                         |
| Car infos                     | Source des valeurs techniques estimees du vehicule.                             | [Car infos](car-infos.md)                                         |
| Car price estimates           | Source de l'estimation de valeur de marche.                                     | [Car price estimates](car-price-estimates.md)                     |
| Normes euro                   | Necessaires pour l'ajustement de taxe non electrique.                           | [Euro norms](euro-norms.md)                                       |
| Car tax base rates            | Tarifs de base de taxe annuelle par region/date/cc.                             | [Car tax base rates](car-tax-base-rates.md)                       |
| Car tax flat rates            | Tarifs forfaitaires de taxe (notamment electrique).                             | [Car tax flat rates](car-tax-flat-rates.md)                       |
| Car tax euro norm adjustments | Ajustements de taxe par groupe de norme euro.                                   | [Car tax euro norm adjustments](car-tax-euro-norm-adjustments.md) |
| Insurance price benchmarks    | Benchmarks assurance : base + part variable.                                    | [Insurance price benchmarks](insurance-price-benchmarks.md)       |

## Liste des simulations

La liste affiche les exécutions avec les données du véhicule saisies et les résultats calculés. Ouvrir une ligne pour voir le résultat détaillé
et les messages d'étapes.

Les colonnes marquées _(masquées par défaut)_ sont disponibles via le sélecteur de colonnes mais ne sont pas affichées au chargement.

| Propriété               | Description                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Description             | Résumé en une ligne : commune, marque, type de carburant et type de véhicule.             |
| Code résultat           | Résultat final (ex. Pas OK, Révision manuelle). Lien vers la page de détail.              |
| Kilométrage             | Kilométrage saisi en km.                                                                  |
| Places assises          | Nombre de places assises.                                                                 |
| Première immat.         | Date de première immatriculation.                                                         |
| Valeur estimée          | Valeur marchande estimée du véhicule utilisée dans le calcul.                             |
| Amortissement/km        | Part d'amortissement par km calculée par le moteur.                                       |
| Assurance/an            | Coût d'assurance annuel estimé.                                                           |
| Créé le                 | Date et heure d'enregistrement de la simulation.                                          |
| Commune                 | Commune sélectionnée pour l'exécution. _(masquée par défaut)_                             |
| Marque                  | Marque du véhicule saisie. _(masquée par défaut)_                                         |
| Type de carburant       | Type de carburant saisi. _(masquée par défaut)_                                           |
| Type de véhicule        | Type de véhicule ou description "Autre". _(masquée par défaut)_                           |
| Km/an propriétaire      | Kilométrage annuel attendu du propriétaire. _(masquée par défaut)_                        |
| Prix d'achat            | Prix d'achat pour les véhicules neufs. _(masquée par défaut)_                             |
| Voiture neuve           | Indique si le véhicule a été marqué comme neuf. _(masquée par défaut)_                    |
| Utilitaire              | Indique si le véhicule a été marqué comme utilitaire. _(masquée par défaut)_              |
| Taxe/an                 | Taxe de circulation annuelle estimée. _(masquée par défaut)_                              |
| Contrôle technique/an   | Coût annuel estimé du contrôle technique. _(masquée par défaut)_                          |
| Entretien/an            | Coût annuel estimé de l'entretien. _(masquée par défaut)_                                 |
| Tarif au km             | Tarif km arrondi final utilisé pour le résultat. _(masquée par défaut)_                   |
| Km partagés min         | Scénario de km partagés minimum (paramètres hub). _(masquée par défaut)_                  |
| Km partagés moy.        | Scénario de km partagés moyen (paramètres hub). _(masquée par défaut)_                    |
| Km partagés max         | Scénario de km partagés maximum (paramètres hub). _(masquée par défaut)_                  |
| Norme Euro              | Norme d'émission Euro du véhicule. _(masquée par défaut)_                                 |
| Ecoscore                | Score environnemental du véhicule. _(masquée par défaut)_                                 |
| Consommation            | Consommation de carburant estimée. _(masquée par défaut)_                                 |
| Cylindrée cc            | Cylindrée du moteur en cc. _(masquée par défaut)_                                         |
| CO2 (g/km)              | Émission de CO2 en g/km. _(masquée par défaut)_                                           |
| Motif de rejet          | Texte explicatif quand le résultat est Pas OK. _(masquée par défaut)_                     |
| Type de véhicule (aut.) | Description personnalisée quand "Autre" a été choisi. _(masquée par défaut)_              |
| Durée (s)               | Durée de l'exécution du moteur en secondes entières. _(masquée par défaut)_               |
| E-mail du résultat      | Adresse utilisée pour envoyer le résultat par e-mail (si définie). _(masquée par défaut)_ |
| Modifié le              | Date et heure de la dernière mise à jour. _(masquée par défaut)_                          |

## Conseils pour les admins

- Garder les tables de reference completes et a jour avant les batchs de simulation.
- Si beaucoup de runs renvoient **Manual review**, verifier si le **prix max vehicule** du hub en est la cause (cas valeur elevee : une etape
  l'explique) ; sinon verifier les references manquantes ou invalides.
- Revoir regulierement les seuils des hubs : ils influencent fortement l'acceptation et la categorie finale.
