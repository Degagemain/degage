---
title: Infos voiture (estimations)
roles:
  - admin
---

# Car Info (estimates)

Données de référence pour les profils véhicule (marque, type de carburant, type de véhicule, année, moteur, CO₂, écoscore, norme euro,
consommation). Utilisées pour les recherches dans la simulation et les estimations de prix.

Ces enregistrements sont générés par IA puis mis en cache. Le cache évite de relancer la génération IA pour le même profil véhicule et rend les
résultats de simulation plus rapides et plus cohérents.

| Propriété     | Description                               |
| ------------- | ----------------------------------------- |
| Marque        | Marque (via type de véhicule).            |
| Carburant     | Type de carburant (via type de véhicule). |
| Type véhicule | Type (marque + carburant + nom).          |
| Année         | Année du modèle.                          |
| Cylindrée cc  | Cylindrée en cc.                          |
| Émission CO₂  | Valeur d'émission CO₂.                    |
| Écoscore      | Score environnemental.                    |
| Norme euro    | Norme d'émission.                         |
| Consommation  | Valeur de consommation.                   |
