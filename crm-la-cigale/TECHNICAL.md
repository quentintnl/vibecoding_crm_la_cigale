# 🛠️ Documentation Technique - CRM La Cigale

## Vue d'ensemble

Ce document détaille l'implémentation technique du CRM Réservations pour La Cigale.

## 🏛️ Architecture

### Pattern Backend-for-Frontend (BFF)

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│   Client    │ ───> │  Next.js Server  │ ───> │   Airtable   │
│  (Browser)  │      │   (API Routes)   │      │     API      │
└─────────────┘      └──────────────────┘      └──────────────┘
                              │
                              │ Secrets (PAT, Base ID)
                              │ Validation (Zod)
                              │ Mapping Données
```

**Avantages :**
- ✅ Sécurité : API Key jamais exposée au client
- ✅ Validation : Données validées avant envoi à Airtable
- ✅ Contrôle : Transformation et mapping des données
- ✅ Cache : Optimisation avec SWR côté client

## 📦 Modules et Responsabilités

### 1. Data Access Layer (`lib/airtable.ts`)

**Responsabilité** : Communication directe avec Airtable

**Fonctions exportées :**
- `getReservations(filters?)` : Récupère les réservations
- `createReservation(data)` : Crée une réservation
- `updateReservation(id, data)` : Met à jour une réservation
- `updateReservationStatus(id, isArrived)` : Change le statut de présence
- `deleteReservation(id)` : Supprime une réservation

**Transformations :**
- Date : `DD/MM/YYYY` (Airtable) ↔️ `YYYY-MM-DD` (ISO/App)
- Statut : `is_here: 0|1` (Airtable) ↔️ `statut: 'A_VENIR'|'ARRIVE'` (App)

### 2. API Routes (`app/api/reservations/`)

**Responsabilité** : Endpoints HTTP sécurisés

#### `POST /api/reservations`
Crée une nouvelle réservation

**Requête :**
```json
{
  "nom": "Dupont",
  "date": "2026-01-16",
  "heure": "19:30",
  "nbPersonnes": 4,
  "telephone": "0612345678",
  "notes": "Allergie aux fruits de mer",
  "statut": "A_VENIR"
}
```

**Réponse (201 Created) :**
```json
{
  "success": true,
  "data": {
    "id": "recXXXXXXXXXXXXXX",
    "nom": "Dupont",
    ...
  }
}
```

#### `GET /api/reservations`
Récupère toutes les réservations

**Query Params (optionnels) :**
- `date` : Filtre par date (format YYYY-MM-DD)
- `statut` : Filtre par statut (A_VENIR ou ARRIVE)

**Réponse (200 OK) :**
```json
{
  "success": true,
  "data": [...],
  "count": 42
}
```

#### `PUT /api/reservations/[id]`
Met à jour une réservation

**Requête (mise à jour complète) :**
```json
{
  "nom": "Martin",
  "nbPersonnes": 6
}
```

**Requête (changement de statut uniquement) :**
```json
{
  "isArrived": true
}
```

#### `DELETE /api/reservations/[id]`
Supprime une réservation

### 3. Hooks (`hooks/useReservations.ts`)

**Responsabilité** : Interface client pour consommer l'API

**Hook principal :**
```typescript
const { reservations, isLoading, isError, mutate } = useReservations(filters?);
```

**Fonctions utilitaires :**
- `createReservation(data)` : Appelle POST /api/reservations
- `updateReservation(id, data)` : Appelle PUT /api/reservations/[id]
- `updateReservationStatus(id, isArrived)` : Raccourci pour changer le statut
- `deleteReservation(id)` : Appelle DELETE /api/reservations/[id]

### 4. Composants UI

#### Composants réutilisables (`components/ui/`)
- `Button` : Boutons avec variants (primary, secondary, danger)
- `Badge` : Badges pour statuts et informations
- `Card` : Conteneurs avec header et body
- `Skeleton` : États de chargement

#### Composants métier
- `Navigation` : Barre de navigation entre les vues
- `ReservationFormModal` : Formulaire création/édition

## 🔐 Sécurité - Checklist d'Implémentation

### ✅ Fait

1. **Variables d'environnement** : `.env.local` avec PAT et Base ID
2. **API Routes** : Toutes les requêtes passent par le serveur Next.js
3. **Pas de NEXT_PUBLIC_** : Aucun secret exposé côté client
4. **Validation Zod** : Données validées côté serveur avant Airtable
5. **Gitignore** : `.env.local` ignoré par Git

### ⚠️ À vérifier avant déploiement

- [ ] Tester l'onglet Network du navigateur (aucune API Key visible)
- [ ] Vérifier que le fichier `.env.local` n'est pas commité
- [ ] Configurer les variables d'environnement sur la plateforme de prod
- [ ] Tester les limites rate limit Airtable (5 req/sec)

## 🎨 Design System

### Palette de couleurs (Tailwind)

**Fond et structure :**
- Page : `bg-slate-50`
- Cartes : `bg-white`
- Bordures : `border-slate-200`

**Actions (Primaire) :**
- Base : `indigo-600`
- Hover : `indigo-700`
- Focus : `ring-indigo-600`

**Statuts :**
- À venir : `blue-100` / `blue-700`
- Arrivé : `emerald-100` / `emerald-700`
- Danger : `red-100` / `red-700`
- Neutre : `slate-100` / `slate-700`

### Typographie

- Police : Inter (variable font)
- Tailles : `text-xs` à `text-2xl`
- Poids : `font-medium` pour les données importantes, `font-semibold` pour les titres

## 🧩 Schéma de Données

### Mapping Airtable ↔️ Application

| Champ Airtable | Type Airtable | Champ App | Type App | Transformation |
|----------------|---------------|-----------|----------|----------------|
| `heure_arrivee` | Text | `heure` | string | Aucune (accepte "19h30" ou "19:30") |
| `date_reservation` | Date | `date` | string | `DD/MM/YYYY` → `YYYY-MM-DD` |
| `nom_client` | Text | `nom` | string | Aucune |
| `nombre_personnes` | Number | `nbPersonnes` | number | Aucune |
| `numero_telephone` | Text | `telephone` | string? | Aucune |
| `champ_complementaire` | Long text | `notes` | string? | Aucune |
| `is_here` | Number (0/1) | `statut` | 'A_VENIR'\|'ARRIVE' | `0` → `A_VENIR`, `1` → `ARRIVE` |

## 📊 Gestion d'État avec SWR

### Configuration

```typescript
const { data, error, isLoading, mutate } = useSWR(key, fetcher);
```

### Stratégie de cache

- **Revalidation automatique** : Lors du focus de la fenêtre
- **Mutation optimiste** : Possible avec `mutate()`
- **Pas de cache local** : SWR gère le cache en mémoire

### Invalidation manuelle

Après chaque action (Create, Update, Delete), on appelle `mutate()` pour recharger les données.

## 🚀 Déploiement

### Vercel (Recommandé)

1. Push le code sur GitHub
2. Importer le projet dans Vercel
3. Configurer les variables d'environnement :
   - `AIRTABLE_PAT`
   - `AIRTABLE_BASE_ID`
   - `AIRTABLE_TABLE_NAME`
4. Déployer

### Build local

```bash
npm run build
npm start
```

## 📈 Performances

### Optimisations implémentées

- **SWR** : Cache client, évite les requêtes redondantes
- **Skeleton loading** : Meilleure perception de performance
- **React 18** : Concurrent rendering

### Points d'attention

- **Rate Limit Airtable** : 5 req/sec maximum
- **Latence API** : Airtable peut être lent (300-500ms)
- **Pas de pagination** : MVP charge toutes les réservations (OK pour ~1000 records max)

## 🔄 Évolutions Futures (V1)

- Pagination pour grandes quantités de données
- Recherche par nom/téléphone
- Notifications (Email/SMS)
- Authentification multi-utilisateurs
- Vue plan de salle
- Export PDF/Excel
- Analytics et KPI

## 📝 Notes Techniques

### Gestion des erreurs

Toutes les fonctions API gèrent 3 types d'erreurs :
1. **Validation** : 400 Bad Request (Zod)
2. **Airtable** : 500 Server Error (Network, Rate Limit, etc.)
3. **Non trouvé** : 404 Not Found (si implémenté)

### Format horaire

Accepte les deux formats :
- Format français : "19h30"
- Format ISO : "19:30"

Le DAL ne transforme pas ce champ, il est stocké tel quel.

### Timezone

⚠️ Pas de gestion de timezone pour V0. Tout est en heure locale française.

