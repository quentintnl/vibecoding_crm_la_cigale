# PRD — CRM Réservations La Cigale

## Contexte
Le restaurant "La Cigale" à Nantes souhaite digitaliser son processus de réservation.
Actuellement gérées manuellement, les réservations doivent être centralisées dans un outil CRM simple et efficace.
La source de données unique est une base **Airtable**.

## Objectifs V0
Fournir une interface web permettant au personnel du restaurant de :
1. Visualiser les réservations existantes.
2. Ajouter de nouvelles réservations rapidement.
3. Modifier ou annuler des réservations.
4. Gérer le statut des clients (présents/absents).

L'objectif est d'avoir un MVP (Minimum Viable Product) fonctionnel, sécurisé et simple à utiliser pour l'équipe (V0).

## Fonctionnalités incluses (V0)

### 1. Gestion des Réservations (CRUD)
- **Créer** une réservation avec les champs obligatoires.
- **Lire** la liste des réservations depuis Airtable.
- **Mettre à jour** les informations d'une réservation (notamment le statut `is_here`).
- **Supprimer** une réservation (annulation).

### 2. Vues Métier
L'application doit proposer trois modes de visualisation distincts :
- **Vue Liste** : Tableau classique avec tri et filtrage simple.
- **Vue Kanban** : Visualisation par statut (ex: À venir / Arrivé / Terminé - *Note: Le champ `is_here` est un booléen, la vue Kanban devra gérer l'état `1` (Arrivé) vs `0` (En attente)*).
- **Vue Planning** : Calendrier affichant les réservations selon `date_reservation` et `heure_arrivee`.

### 3. Modèle de Données (Airtable)
Le schéma de données est strict et imposé par la base existante (CSV) :
- `heure_arrivee` (Texte/Heure) : Heure d'arrivée prévue (ex: "19h30").
- `date_reservation` (Date) : Date de la réservation (ex: "16/01/2026").
- `nom_client` (Texte) : Nom du client.
- `nombre_personnes` (Nombre) : Nombre de convives.
- `numero_telephone` (Texte) : Contact client.
- `champ_complementaire` (Texte Long) : Notes ou demandes spéciales (Allergies, table préférée, etc.).
- `is_here` (Booléen/Entier) : Statut de présence (1 = Présent, 0 = Non Arrivé).

## Hors Scope (V0)
- Authentification utilisateur complexe (Login/Mdp individuel).
- Envoi d'emails ou SMS de confirmation.
- Système de plan de salle graphique.
- Gestion des stocks ou menus.
- Paiement en ligne.
- Historique avancé des clients.

## Definition of Done (DoD)
Une fonctionnalité est considérée comme "Done" si :
- [ ] Le code est commité et pushé sur le dépôt.
- [ ] La fonctionnalité est testée manuellement et fonctionne sans erreur critique.
- [ ] Les données sont correctement synchronisées avec Airtable (Lecture/Écriture).
- [ ] L'interface est responsive (Mobile/Tablette/Desktop).
- [ ] Aucun secret (API Key, Base ID) n'est présent dans le code source ou le build client.
- [ ] Les 3 vues (Liste, Kanban, Planning) sont implémentées et fonctionnelles.

## Règles de Sécurité
- **Zéro Trust Client-Side** : Les clés API Airtable ne doivent JAMAIS être exposées côté client (navigateur).
- **Variables d'Environnement** : Tous les secrets doivent être stockés dans des variables d'environnement (`.env`) côté serveur/proxy.
- **Validation** : Les données d'entrée doivent être validées avant envoi à Airtable.

## Décisions Produit

| Décision | Justification | Validation |
| :--- | :--- | :--- |
| **Source of Truth** | Airtable est imposé par le client et le workflow existant. | ✅ Validé (PDF) |
| **Format Date** | Format `DD/MM/YYYY` conforme au CSV pour l'affichage, conversion ISO pour l'API si nécessaire. | ✅ Technique |
| **Vue Kanban** | Sera basée sur le champ `is_here` (Non Arrivé / Arrivé) ou une logique simplifiée faute de champ "Statut" complexe. | ⚠️ À confirmer UX |
| **Tech Stack** | Choix laissé à l'Architecte, mais doit supporter les appels API sécurisés (Backend for Frontend ou SSR recommandé). | ✅ Architecte |

