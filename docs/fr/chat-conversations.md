---
roles:
  - admin
---

# Fils de chat

## Objectif

La page des fils de chat aide les admins à déboguer les réponses du chatbot de support et à améliorer le contenu d'aide utilisé par l'assistant.

## Propriétés

| Propriété   | Description                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| Titre       | Le titre de chat enregistré. Il peut être vide pour les chats nouveaux ou sans titre. |
| Utilisateur | L'utilisateur lié au chat, ou Anonyme lorsqu'aucun utilisateur n'a été enregistré.    |
| Créé le     | Date de création du fil.                                                              |
| Modifié le  | Date de dernière modification du fil.                                                 |

Ouvrez un fil pour voir tout l'historique du chat. Les messages de l'assistant peuvent contenir une section tool calls repliée avec les articles
utilisés pour construire la réponse.
