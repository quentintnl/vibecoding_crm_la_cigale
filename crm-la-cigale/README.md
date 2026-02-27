# 🦗 CRM Réservations - La Cigale

Application web de gestion des réservations pour le restaurant La Cigale à Nantes.

## 📋 Fonctionnalités V0

- ✅ **Vue Liste** : Tableau complet avec toutes les réservations
- ✅ **Vue Kanban** : Colonnes "À venir" / "Arrivé" pour gérer le flux
- ✅ **Vue Planning** : Calendrier hebdomadaire/mensuel
- ✅ **CRUD Complet** : Créer, Modifier, Supprimer des réservations
- ✅ **Statut de présence** : Marquer un client comme arrivé/absent
- ✅ **Interface responsive** : Optimisée pour mobile, tablette et desktop

## 🏗️ Architecture Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : Airtable (Source of Truth)
- **Sécurité** : API Routes (BFF Pattern) - Clés API jamais exposées côté client
- **State Management** : SWR (Cache, Revalidation automatique)
- **Validation** : Zod (côté serveur)

## 🚀 Installation et Configuration

### 1. Prérequis

- Node.js 18+ et npm
- Compte Airtable avec une base contenant la table "Reservations"

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration Airtable

#### a) Créer un Personal Access Token (PAT)

1. Allez sur https://airtable.com/create/tokens
2. Créez un nouveau token avec les scopes suivants :
   - `data.records:read`
   - `data.records:write`
3. Sélectionnez votre base dans "Access"
4. Copiez le token généré

#### b) Obtenir votre Base ID

1. Ouvrez votre base Airtable dans le navigateur
2. L'URL ressemble à : `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copiez la partie `appXXXXXXXXXXXXXX`

#### c) Configurer les variables d'environnement

Copiez le fichier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Éditez `.env.local` et remplacez les valeurs :

```env
AIRTABLE_PAT=patXXXXXXXXXXXXXX.YYYYYYYYYYYYYYYY
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Reservations
```

⚠️ **IMPORTANT** : Ne JAMAIS commiter le fichier `.env.local` !

### 4. Schéma Airtable requis

Votre table Airtable doit contenir ces champs (noms exacts) :

| Nom du champ | Type Airtable | Description |
|--------------|---------------|-------------|
| `heure_arrivee` | Single line text | Ex: "19h30" ou "19:30" |
| `date_reservation` | Date | Format DD/MM/YYYY |
| `nom_client` | Single line text | Nom du client |
| `nombre_personnes` | Number | Nombre de convives |
| `numero_telephone` | Single line text (optionnel) | Téléphone |
| `champ_complementaire` | Long text (optionnel) | Notes, allergies, etc. |
| `is_here` | Number | 0 = À venir, 1 = Arrivé |

### 5. Démarrage de l'application

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 📱 Utilisation

### Navigation

- **Liste** : Vue tableau classique avec toutes les informations
- **Kanban** : Vue par colonnes (À venir / Arrivé)
- **Planning** : Vue calendrier (Semaine / Mois)

### Actions disponibles

#### Créer une réservation
1. Cliquez sur "Nouvelle réservation"
2. Remplissez le formulaire
3. Cliquez sur "Créer"

#### Modifier une réservation
1. Dans la vue Liste, cliquez sur l'icône ✏️ (Modifier)
2. Modifiez les champs nécessaires
3. Cliquez sur "Enregistrer"

#### Marquer un client présent
1. Cliquez sur l'icône ✓ (CheckCircle)
2. Le statut passe automatiquement à "Arrivé"

#### Supprimer une réservation
1. Cliquez sur l'icône 🗑️ (Supprimer)
2. Confirmez la suppression

## 🔒 Sécurité

- ✅ Clés API Airtable **JAMAIS** exposées côté client
- ✅ Toutes les requêtes passent par les API Routes Next.js
- ✅ Validation des données avec Zod côté serveur
- ✅ Variables d'environnement pour tous les secrets

## 📂 Structure du Projet

```
crm-cigale/
├── app/
│   ├── api/
│   │   └── reservations/         # API Routes (Backend)
│   │       ├── route.ts           # GET, POST
│   │       └── [id]/route.ts      # PUT, DELETE
│   ├── liste/                     # Vue Liste
│   ├── kanban/                    # Vue Kanban
│   ├── planning/                  # Vue Planning
│   └── layout.tsx                 # Layout principal
├── components/
│   ├── ui/                        # Composants UI réutilisables
│   ├── Navigation.tsx             # Barre de navigation
│   └── ReservationFormModal.tsx   # Formulaire création/édition
├── hooks/
│   └── useReservations.ts         # Hooks SWR pour les appels API
├── lib/
│   ├── airtable.ts                # DAL - Data Access Layer
│   └── validation.ts              # Schémas Zod
├── types/
│   └── reservation.ts             # Types TypeScript
└── .env.local                     # Configuration (NON COMMITÉ)
```

## 🚨 Dépannage

### Erreur "Configuration Airtable manquante"
- Vérifiez que le fichier `.env.local` existe
- Vérifiez que `AIRTABLE_PAT` et `AIRTABLE_BASE_ID` sont bien renseignés

### Erreur 401 Unauthorized
- Vérifiez que votre PAT Airtable est valide
- Vérifiez les scopes du token (read + write requis)

### Erreur 404 Not Found
- Vérifiez que `AIRTABLE_BASE_ID` correspond bien à votre base
- Vérifiez que `AIRTABLE_TABLE_NAME` correspond au nom de votre table

### Les dates ne s'affichent pas correctement
- Vérifiez que les dates dans Airtable sont au format DD/MM/YYYY
- Le DAL convertit automatiquement entre DD/MM/YYYY et ISO (YYYY-MM-DD)

## 📦 Déploiement Production

### Recommandations de plateforme

- **Vercel** (Recommandé) : Support natif Next.js, configuration simple
- **Netlify** : Alternative viable avec support Next.js

### Configuration en production

N'oubliez pas de configurer les variables d'environnement sur votre plateforme :
- `AIRTABLE_PAT`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`

## 📄 Licence

Projet privé - Restaurant La Cigale

