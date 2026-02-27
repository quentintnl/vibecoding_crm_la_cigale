# RAID Log — CRM Réservations La Cigale

Ce document recense les Risques, Hypothèses (Assumptions), Problèmes (Issues) et Dépendances (Dependencies) identifiés pour la V0.

## Risques (Risk)

| ID | Description | Impact (1-5) | Probabilité (1-5) | Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Limites API Airtable** (Rate Limit : 5 req/sec). Risque de blocage si utilisation intensive. | 3 | 2 | Utiliser un cache simple ou un délai entre les requêtes (Backoff). |
| **R-02** | **Données Invalides**. Airtable est permissif. Risque de `date_reservation` mal formée. | 4 | 3 | Validation stricte côté serveur (Zod/Joi) avant envoi. Rejet des dates invalides. |
| **R-03** | **Fuite de Clé API**. Exposition accidentelle dans le front. | 5 | 2 | Code review stricte. Utilisation de `.env`. Pas d'appel direct depuis `useEffect` ou composant client. |
| **R-04** | **Perte de Connexion**. Le restaurant peut avoir un réseau instable. | 3 | 3 | Afficher un message d'erreur clair "Hors Ligne/Erreur Serveur". Cache navigateur si possible (PWA ou simple état local). |

## Hypothèses (Assumptions)

| ID | Description | Statut |
| :--- | :--- | :--- |
| **A-01** | La base Airtable suit strictement les colonnes du CSV fourni (`heure_arrivee`, etc.). | **À Vérifier** |
| **A-02** | Le champ `is_here` est un nombre (1/0) ou booléen, pas un texte "Oui/Non". | **Supposé Vrai** (CSV montre `1`) |
| **A-03** | Les utilisateurs (Staff) utiliseront une tablette ou un PC/Mac récent (Chrome/Safari). | **Validé** |
| **A-04** | Pas d'authentification utilisateur requise pour la V0 (accès via URL ou protection basique serveur web). | **Validé V0** |

## Problèmes (Issues)

| ID | Description | Action Requise |
| :--- | :--- | :--- |
| **I-01** | Absence de champ "ID Unique" explicite dans le CSV. Airtable fournit un `recordId` interne. | Utiliser le `recordId` d'Airtable comme clé primaire pour les Updates/Deletes. |
| **I-02** | Format de date CSV (`DD/MM/YYYY`) vs Format API (ISO 8601). | Conversion nécessaire dans la couche API/Service. |

## Dépendances (Dependencies)

| ID | Description | Propriétaire |
| :--- | :--- | :--- |
| **D-01** | **Clé API Airtable** et **Base ID**. Doivent être fournis par le client/admin système. | Client |
| **D-02** | **Hébergement** supportant Node.js/Next.js (Vercel, Netlify, ou VPS). | Architecte / DevOps |
| **D-03** | Disponibilité du service Airtable (SLA). | Airtable |

