# Architecture — CRM Réservations La Cigale

## 1. Rappel du contexte

Le projet consiste à développer un CRM minimaliste (V0) pour la gestion des réservations du restaurant "La Cigale".
L'application doit permettre la visualisation (Liste, Kanban, Planning), la création, la modification et l'annulation de réservations.
La source de vérité des données est une base **Airtable** existante.

**Contraintes techniques majeures :**
*   **Sécurité** : Aucune clé API Airtable ne doit être exposée côté client (Browser).
*   **Données** : Respect strict du schéma de données Airtable imposé (champs, types).
*   **Stack** : Application Web (Next.js recommandé) avec une couche API intégrée (BFF - Backend for Frontend) pour sécuriser les appels.

## 2. Vue d’ensemble de l’architecture

L'architecture retenue est celle d'une application **Next.js** (React) hébergeant à la fois le Front-end et une couche API serveur légère (API Routes).

*   **Front-end (Client)** : Interface utilisateur (Pages Liste, Kanban, Planning). Interagit uniquement avec l'API interne du projet (`/api/reservations`).
*   **Couche API / Proxy (Serveur Next.js)** : Reçoit les requêtes du Front-end, valide les données, ajoute la clé API secrète, et transmet la requête à Airtable.
*   **DAL (Data Access Layer)** : Module de code isolant la logique de communication avec Airtable (formatage des données, gestion des erreurs, mappage des types).
*   **Airtable** : Base de données externe (SaaS).

## 3. Décisions techniques clés

### 3.1 Authentification Airtable

| Option | Avantages | Inconvénients |
| :--- | :--- | :--- |
| **PAT (Personal Access Token)** | Simple à générer. Granularité des permissions (Scopes). Idéal pour un usage "système" (Service Account). Revocation facile. | Lié à un compte utilisateur Airtable spécifiquement. |
| **OAuth** | Standard sécurisé pour les applications tierces (marketplace). Permet à chaque utilisateur de se connecter avec son propre compte Airtable. | Complexité d'implémentation élevée (Redirect flows, Token refresh). Surdimensionné pour un outil interne utilisé par une seule équipe sur une seule base. |

**Recommandation :**
**Utilisation d'un PAT (Personal Access Token).**
*Justification* : Le projet est un outil interne pour un restaurant unique. Il n'y a pas besoin de gérer des connexions utilisateurs multiples vers des comptes Airtable différents. Le PAT sera configuré comme une variable d'environnement serveur.

---

### 3.2 Accès à l’API Airtable

| Option | Avantages | Inconvénients |
| :--- | :--- | :--- |
| **Proxy API (Backend-for-Frontend)** | **Sécurité maximale** : La clé API reste sur le serveur. Contrôle total des données échangées. Possibilité de cache et de validation stricte. | Nécessite un serveur (Node.js/Next.js). Ajoute une légère latence (hop supplémentaire). |
| **Appels directs (Front-to-Airtable)** | Simplicité de mise en place initiale (pas de backend). Moins de code. | **Sécurité critique** : Expose la clé API dans le code client ou le réseau, permettant à n'importe qui de modifier/supprimer la base. |

**Recommandation :**
**Proxy API (Next.js API Routes).**
*Justification* : La contrainte de sécurité "Zéro Trust Client-Side" est bloquante. Les appels directs sont strictement interdits pour une API Key avec droits d'écriture. Le Proxy est obligatoire.

---

## 4. Stratégie de sécurité

*   **Stockage des secrets** :
    *   Les secrets (`AIRTABLE_PAT`, `AIRTABLE_BASE_ID`) sont stockés **uniquement** dans des variables d'environnement serveur (`.env` non versionné).
    *   En local : `.env.local`.
    *   En prod : Variables d'environnement de la plateforme d'hébergement.
*   **Interdictions strictes** :
    *   NE JAMAIS commiter un fichier `.env`.
    *   NE JAMAIS utiliser `NEXT_PUBLIC_` pour les clés API Airtable.
    *   NE JAMAIS exposer l'ID de la base ou la clé API dans le code client compilé.
*   **Validation** :
    *   Toutes les données entrantes (Payloads POST/PUT) doivent être validées côté serveur (ex: Zod) avant d'être envoyées à Airtable pour éviter l'injection de données corrompues.

## 5. Contrat Data Access Layer (DAL)

### Objectif
Isoler la logique technique Airtable (endpoints, headers, conversion JSON) du reste de l'application. Le reste de l'app utilise des objets métier propres.

### Définition des Types (Logique)

```typescript
type Reservation = {
  id: string; // Airtable Record ID
  nom: string; // Nom Client
  date: string; // ISO Date String (YYYY-MM-DD)
  heure: string; // Heure Arrivee (HH:mm)
  nbPersonnes: number;
  telephone?: string;
  notes?: string; // Champ complémentaire
  statut: 'A_VENIR' | 'ARRIVE'; // Mappé depuis is_here boolean (0/1)
}
```

### Fonctions CRUD exposées

L'implémentation technique (bibliothèque `airtable` ou `fetch`) est encapsulée ici.

1.  **`getReservations(filters?: { date?: string })`**
    *   **Retour** : `Promise<Reservation[]>`
    *   **Description** : Récupère la liste des réservations. Filtre optionnel par date pour la vue Planning/Liste.

2.  **`createReservation(data: Omit<Reservation, 'id'>)`**
    *   **Retour** : `Promise<Reservation>` (L'objet créé avec son ID)
    *   **Description** : Crée une réservation. Valide les champs obligatoires.

3.  **`updateReservationStatus(id: string, isArrived: boolean)`**
    *   **Retour** : `Promise<Reservation>`
    *   **Description** : Met à jour uniquement le champ `is_here`.

4.  **`updateReservation(id: string, data: Partial<Omit<Reservation, 'id'>>)`**
    *   **Retour** : `Promise<Reservation>`
    *   **Description** : Met à jour les détails d'une réservation (ex: changement nombre personnes).

5.  **`deleteReservation(id: string)`**
    *   **Retour** : `Promise<void>`
    *   **Description** : Supprime une réservation.

## 6. Points de vigilance pour la suite

*   **Rate Limiting Airtable** : L'API est limitée à 5 requêtes/seconde. Le DAL devra gérer les erreurs 429 (Too Many Requests) avec une stratégie de "retry" ou afficher une erreur utilisateur claire.
*   **Format des Dates** : Attention à la conversion entre le format `DD/MM/YYYY` (donnée textuelle possiblement reçue ou attendue par le CSV) et les objets Date JS / ISO 8601 pour l'API. La DAL doit normaliser cela.
*   **Latence** : Airtable peut être lent. Prévoir des états de chargement (Skeletons/Spinners) dans l'UI.
*   **Validation UX** : Confirmer que le champ `is_here` est bien la seule source de vérité pour le statut "Arrivé" vs "À venir".

