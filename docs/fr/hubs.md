---
title: Hubs
roles:
  - admin
---

# Hubs

Les hubs sont des zones operationnelles avec leurs propres parametres de simulation.

Pour chaque execution, la simulation utilise le hub de la commune selectionnee. L'admission, les couts estimes et la categorie finale peuvent
donc varier selon la zone.

## Comment la simulation utilise le hub

1. **Admission** — Le vehicule doit respecter **Sim max age** et **Sim max km**. Si un controle echoue, resultat immediat **Not OK**.
2. **Plafond prix vehicule** — Si **Prix max véhicule (revue manuelle)** est renseigne et que la valeur estimee (ou le prix d'achat) est
   **superieure** a ce montant en euros, une execution qui se serait terminee en **Category A** ou **Category B** devient **Manual review**
   (avec une etape qui indique le resultat prevu). **Not OK** reste inchange. Vide = pas de plafond.
3. **Valeur et depreciation** — **Sim depreciation km** (ou **Sim depreciation km electric**) influence directement la baisse de valeur par km.
   Si le cout de depreciation estime par km est inferieur a **Min dépréc. EUR/km**, il est releve a ce plancher.
4. **Couts fixes dans le taux km** — **Sim inspection cost per year** et **Sim maintenance cost per year** entrent dans le cout annuel fixe,
   puis dans le taux au km final.
5. **Scenarios de km partages** — **Km partagés min/an**, **Km partagés moy./an** et **Km partagés max/an** sont stockes sur les simulations et
   alimentent les scenarios de partage faible, regulier et eleve.
6. **Points qualite** — Le vehicule doit obtenir au moins 2 points bonus via **Sim min ecoscore for bonus**, **Sim max km for bonus** et **Sim
   max age for bonus**.
7. **Categorie finale** — Selon le score qualite, le cout au km arrondi (EUR/km), les places et le contexte du hub, le resultat devient
   **Category A**, **Category B** ou **Not OK**. Pour **Category A** avec moins de 7 places, le cout au km arrondi doit etre au plus **Cat. A
   max EUR/km (moins de 7 places)**. Pour **Category B** avec 7 places ou plus, au plus **Cat. B max EUR/km (7 places ou plus)**. Les **vans**
   sont rattaches a **Category B**. Avant l'attribution de categorie, le cout de depreciation par km est plafonne par hub. Les vehicules
   standards utilisent **Max dépréc. EUR/km (cat. A)** ; les vehicules **electriques** et les candidats **category B** (7 places ou plus, ou
   vans) utilisent **Max dépréc. EUR/km (électrique & cat. B)**. Si le cout est trop eleve, la valeur est ajustee dans sa fourchette si possible
   ; sinon le vehicule est refuse.

## Propriétés

| Propriété                                | Description                                                                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom                                      | Nom d'affichage du hub.                                                                                                                                         |
| Défaut                                   | Indique si c'est le hub par defaut. Ce hub applique des regles supplementaires de repli lors de l'attribution de categorie.                                     |
| Sim max age                              | **Admission.** Âge max. du véhicule en années (à partir de la première immatriculation). Les véhicules plus âgés sont refusés (Not OK).                         |
| Sim max km                               | **Admission.** Kilométrage max. en km. Un kilométrage supérieur est refusé (Not OK).                                                                            |
| Km partagés min/an                       | **Scenario partage.** Kilometres partages utilises pour le scenario faible.                                                                                     |
| Km partagés moy./an                      | **Scenario partage.** Kilometres partages utilises pour le scenario regulier et l'estimation moyenne backend.                                                   |
| Km partagés max/an                       | **Scenario partage.** Kilometres partages utilises pour le scenario eleve.                                                                                      |
| Sim max price (manual review)            | **Plafond prix.** Renseigne (euros) : les regles donneraient **Category A** ou **B** mais la valeur est trop haute → **Manual review** ; vide = pas de plafond. |
| Cat. A max EUR/km (moins de 7 places)    | **Category A.** Cout au km arrondi maximal (EUR/km) pour le premier palier d'acceptation si le vehicule a moins de 7 places.                                    |
| Cat. B max EUR/km (7 places ou plus)     | **Category B.** Cout au km arrondi maximal (EUR/km) si le vehicule a 7 places ou plus.                                                                          |
| Max dépréc. EUR/km (cat. A)              | **Tous les hubs.** Cout de depreciation par km maximal (EUR/km) pour les vehicules standards (non electriques, hors category B).                                |
| Max dépréc. EUR/km (électrique & cat. B) | **Electrique et category B.** Cout de depreciation par km maximal (EUR/km) pour les vehicules electriques et les candidats category B (7+ places ou vans).      |
| Min dépréc. EUR/km                       | **Dépréciation.** Cout de depreciation par km minimal (EUR/km) utilise dans la simulation ; les estimations plus basses sont relevees a cette valeur.           |
| Sim min euro norm group diesel           | Seuil diesel stocke au niveau hub. Disponible dans les donnees admin, mais actuellement non utilise directement dans la decision finale de la simulation.       |
| Sim min ecoscore for bonus               | **Qualité.** Si l'écoscore du véhicule ≥ cette valeur, il reçoit 1 point bonus. Il faut 2+ points pour passer.                                                  |
| Sim max km for bonus                     | **Qualité.** Si le kilométrage ≤ cette valeur, le véhicule reçoit 1 point bonus.                                                                                |
| Sim max age for bonus                    | **Qualité.** Si l'âge (année en cours − année de construction) ≤ cette valeur, le véhicule reçoit 1 point bonus.                                                |
| Sim depreciation km                      | **Dépréciation.** Total de km sur lequel un véhicule non électrique est supposé se déprécier à zéro. Utilisé pour la valeur et le coût de dépréciation par km.  |
| Sim depreciation km electric             | **Dépréciation.** Idem pour les véhicules électriques (souvent une valeur plus élevée).                                                                         |
| Sim inspection cost per year             | **Coût fixe.** Coût annuel de contrôle technique (€) dans le coût annuel fixe et le taux au km.                                                                 |
| Sim maintenance cost per year            | **Coût fixe.** Coût annuel d'entretien (€) dans le coût annuel fixe et le taux au km.                                                                           |

## Conseils admin

- Maintenir des seuils hub coherents par zone : de petits ajustements peuvent changer fortement les resultats.
- Revoir regulierement **Sim max km**, **Sim max age**, **Sim min ecoscore for bonus** et les champs de depreciation, car ils influencent
  directement rejet et score qualite.
- Renseigner explicitement les couts annuels pour garder des taux km stables et comparables entre hubs.

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.

## Import

Utilisez **Plus → Importer** pour téléverser un fichier JSON obtenu précédemment via Exporter. Les enregistrements avec un id sont mis à jour ;
ceux sans id sont ajoutés. Chaque ligne affiche son propre statut, et un échec n'arrête pas les autres lignes.
