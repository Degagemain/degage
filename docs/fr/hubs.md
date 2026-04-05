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
   **superieure** a ce montant en euros, une execution qui se serait terminee en **Category A**, **Category B** ou **Higher rate** devient
   **Manual review** (avec une etape qui indique le resultat prevu). **Not OK** reste inchange. Vide = pas de plafond.
3. **Valeur et depreciation** — **Sim depreciation km** (ou **Sim depreciation km electric**) influence directement la baisse de valeur par km.
4. **Couts fixes dans le taux km** — **Sim inspection cost per year** et **Sim maintenance cost per year** entrent dans le cout annuel fixe,
   puis dans le taux au km final.
5. **Points qualite** — Le vehicule doit obtenir au moins 2 points bonus via **Sim min ecoscore for bonus**, **Sim max km for bonus** et **Sim
   max age for bonus**.
6. **Categorie finale** — Selon le score qualite, le cout au km arrondi (EUR/km), les places et le contexte du hub, le resultat devient
   **Category A**, **Category B**, **Higher rate** ou **Not OK**. Pour **Category A** avec moins de 7 places, le cout au km arrondi doit etre au
   plus **Cat. A max EUR/km (moins de 7 places)**. Pour **Category B** avec 7 places ou plus, au plus **Cat. B max EUR/km (7 places ou plus)**.
   Sur le **hub par defaut** seulement, **Category A** peut encore s'appliquer si le cout de depreciation par km est au plus **Cat. A dépréc.
   EUR/km (hub par défaut)**. Pour les vehicules **electriques**, **Category A** peut s'appliquer si le cout de depreciation par km est au plus
   **Cat. A dépréc. EUR/km (électrique)**.

## Propriétés

| Propriété                              | Description                                                                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom                                    | Nom d'affichage du hub.                                                                                                                                                     |
| Défaut                                 | Indique si c'est le hub par defaut. Ce hub applique des regles supplementaires de repli lors de l'attribution de categorie.                                                 |
| Sim max age                            | **Admission.** Âge max. du véhicule en années (à partir de la première immatriculation). Les véhicules plus âgés sont refusés (Not OK).                                     |
| Sim max km                             | **Admission.** Kilométrage max. en km. Un kilométrage supérieur est refusé (Not OK).                                                                                        |
| Sim max price (manual review)          | **Plafond prix.** Renseigne (euros) : les regles donneraient **Category A/B** ou **Higher rate** mais la valeur est trop haute → **Manual review** ; vide = pas de plafond. |
| Cat. A max EUR/km (moins de 7 places)  | **Category A.** Cout au km arrondi maximal (EUR/km) pour le premier palier d'acceptation si le vehicule a moins de 7 places.                                                |
| Cat. B max EUR/km (7 places ou plus)   | **Category B.** Cout au km arrondi maximal (EUR/km) si le vehicule a 7 places ou plus.                                                                                      |
| Cat. A dépréc. EUR/km (hub par défaut) | **Hub par defaut uniquement.** Cout de depreciation par km maximal (EUR/km) pour un repli **Category A** si les paliers precedents ne s'appliquent pas.                     |
| Cat. A dépréc. EUR/km (électrique)     | **Electrique uniquement.** Cout de depreciation par km maximal (EUR/km) pour **Category A** avec carburant electrique (apres les autres paliers).                           |
| Sim min euro norm group diesel         | Seuil diesel stocke au niveau hub. Disponible dans les donnees admin, mais actuellement non utilise directement dans la decision finale de la simulation.                   |
| Sim min ecoscore for bonus             | **Qualité.** Si l'écoscore du véhicule ≥ cette valeur, il reçoit 1 point bonus. Il faut 2+ points pour passer.                                                              |
| Sim max km for bonus                   | **Qualité.** Si le kilométrage ≤ cette valeur, le véhicule reçoit 1 point bonus.                                                                                            |
| Sim max age for bonus                  | **Qualité.** Si l'âge (année en cours − année de construction) ≤ cette valeur, le véhicule reçoit 1 point bonus.                                                            |
| Sim depreciation km                    | **Dépréciation.** Total de km sur lequel un véhicule non électrique est supposé se déprécier à zéro. Utilisé pour la valeur et le coût de dépréciation par km.              |
| Sim depreciation km electric           | **Dépréciation.** Idem pour les véhicules électriques (souvent une valeur plus élevée).                                                                                     |
| Sim inspection cost per year           | **Coût fixe.** Coût annuel de contrôle technique (€) dans le coût annuel fixe et le taux au km.                                                                             |
| Sim maintenance cost per year          | **Coût fixe.** Coût annuel d'entretien (€) dans le coût annuel fixe et le taux au km.                                                                                       |

## Conseils admin

- Maintenir des seuils hub coherents par zone : de petits ajustements peuvent changer fortement les resultats.
- Revoir regulierement **Sim max km**, **Sim max age**, **Sim min ecoscore for bonus** et les champs de depreciation, car ils influencent
  directement rejet et score qualite.
- Renseigner explicitement les couts annuels pour garder des taux km stables et comparables entre hubs.

## Export

Utilisez **Plus → Exporter** pour télécharger la liste filtrée/triée en CSV ou JSON.
