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
2. **Valeur et depreciation** — **Sim depreciation km** (ou **Sim depreciation km electric**) influence directement la baisse de valeur par km.
3. **Couts fixes dans le taux km** — **Sim inspection cost per year** et **Sim maintenance cost per year** entrent dans le cout annuel fixe,
   puis dans le taux au km final.
4. **Points qualite** — Le vehicule doit obtenir au moins 2 points bonus via **Sim min ecoscore for bonus**, **Sim max km for bonus** et **Sim
   max age for bonus**.
5. **Categorie finale** — Selon le score qualite, le taux km, les places et le contexte du hub, le resultat devient **Category A**, **Category
   B**, **Higher rate** ou **Not OK**.

## Propriétés

| Propriété                      | Description                                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom                            | Nom d'affichage du hub.                                                                                                                                        |
| Défaut                         | Indique si c'est le hub par defaut. Ce hub applique des regles supplementaires de repli lors de l'attribution de categorie.                                    |
| Sim max age                    | **Admission.** Âge max. du véhicule en années (à partir de la première immatriculation). Les véhicules plus âgés sont refusés (Not OK).                        |
| Sim max km                     | **Admission.** Kilométrage max. en km. Un kilométrage supérieur est refusé (Not OK).                                                                           |
| Sim min euro norm group diesel | Seuil diesel stocke au niveau hub. Disponible dans les donnees admin, mais actuellement non utilise directement dans la decision finale de la simulation.      |
| Sim min ecoscore for bonus     | **Qualité.** Si l'écoscore du véhicule ≥ cette valeur, il reçoit 1 point bonus. Il faut 2+ points pour passer.                                                 |
| Sim max km for bonus           | **Qualité.** Si le kilométrage ≤ cette valeur, le véhicule reçoit 1 point bonus.                                                                               |
| Sim max age for bonus          | **Qualité.** Si l'âge (année en cours − année de construction) ≤ cette valeur, le véhicule reçoit 1 point bonus.                                               |
| Sim depreciation km            | **Dépréciation.** Total de km sur lequel un véhicule non électrique est supposé se déprécier à zéro. Utilisé pour la valeur et le coût de dépréciation par km. |
| Sim depreciation km electric   | **Dépréciation.** Idem pour les véhicules électriques (souvent une valeur plus élevée).                                                                        |
| Sim inspection cost per year   | **Coût fixe.** Coût annuel de contrôle technique (€) dans le coût annuel fixe et le taux au km.                                                                |
| Sim maintenance cost per year  | **Coût fixe.** Coût annuel d'entretien (€) dans le coût annuel fixe et le taux au km.                                                                          |

## Conseils admin

- Maintenir des seuils hub coherents par zone : de petits ajustements peuvent changer fortement les resultats.
- Revoir regulierement **Sim max km**, **Sim max age**, **Sim min ecoscore for bonus** et les champs de depreciation, car ils influencent
  directement rejet et score qualite.
- Renseigner explicitement les couts annuels pour garder des taux km stables et comparables entre hubs.
