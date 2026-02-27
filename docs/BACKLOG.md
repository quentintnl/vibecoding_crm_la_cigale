# BACKLOG — CRM Réservations La Cigale

## Priorité : V0 (Must Have)
Ce backlog contient uniquement les éléments requis pour la version 0 (MVP).

| ID | User Story | Priorité | Critères d'Acceptation | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | En tant que membre du staff, je veux **voir la liste des réservations** pour connaître les clients attendus. | **Haute** | - Liste paginée ou scrollable<br>- Affichage des champs clés (Nom, Date, Heure, Nb Pers)<br>- Tri par date/heure par défaut | À faire |
| **US-02** | En tant que membre du staff, je veux **créer une nouvelle réservation** pour enregistrer un client. | **Haute** | - Formulaire de création<br>- Validation des champs obligatoires<br>- Date et Heure valides<br>- Enregistrement immédiat dans Airtable | À faire |
| **US-03** | En tant que membre du staff, je veux **modifier une réservation** (nombre de personnes, horaire, notes) pour gérer les changements. | **Moyenne** | - Formulaire d'édition pré-rempli<br>- Mise à jour confirmée visuellement | À faire |
| **US-04** | En tant que membre du staff, je veux **supprimer une réservation** en cas d'erreur ou d'annulation. | **Moyenne** | - Bouton de suppression avec confirmation "Êtes-vous sûr ?"<br>- Disparition de la liste après succès | À faire |
| **US-05** | En tant que membre du staff, je veux **marquer un client "Présent"** (`is_here = 1`) pour suivre l'occupation. | **Haute** | - Toggle ou bouton simple d'accès<br>- Changement visuel (couleur/icône) immédiat | À faire |
| **US-06** | En tant que membre du staff, je veux une **vue Kanban** (A venir / Arrivé) pour visualiser le flux de service. | **Haute** | - Colonnes basées sur `is_here` (0 vs 1)<br>- Drag & drop (idéalement) ou bouton de changement de colonne | À faire |
| **US-07** | En tant que membre du staff, je veux une **vue Planning** (Calendrier) pour voir la charge de travail par jour. | **Haute** | - Affichage mensuel/hebdomadaire<br>- Réservations visibles sur les cases du jour correspondant | À faire |
| **TECH-01** | En tant que développeur, je dois **sécuriser la connexion Airtable** pour ne jamais exposer l'API Key. | **CRITIQUE** | - Usage de variables d'environnement (.env)<br>- Proxy serveur ou Next.js API Routes (pas d'appels directs front) | À faire |

## Priorité : V1 (Nice to Have - HORS SCOPE V0)
- Recherche de réservation par nom ou téléphone.
- Notifications automatiques (Email/SMS).
- Gestion multi-comptes utilisateurs.
- Historique des modifications (Logs).
- Vue Plan de Salle.

## Notes de Planification
- Sprint 1 : Setup projet, Connexion Airtable, Liste (Read).
- Sprint 2 : Création (Create) et Modification (Update/Delete).
- Sprint 3 : Vues Kanban et Planning.
- Sprint 4 : UI/UX Polish et Sécurité/Déploiement.

