# Team Briefs — CRM Réservations La Cigale

Ce document sert de feuille de route pour chaque rôle technique sur le projet V0.

## 🏗️ Architecte (Architecte.md)

**Objectif Principal** : Définir une stack technique robuste, simple et sécurisée pour un MVP Airtable.

**Directives :**
1. **Stack Recommandée** : Next.js (React) ou équivalent permettant le SSR/API Routes pour cacher la clé API. Tailwind CSS pour le style rapide.
2. **Architecture** : Pattern "Backend-for-Frontend" (BFF). Le front appelle `/api/reservations` qui appelle Airtable. Jamais d'appel direct Front -> Airtable.
3. **Sécurité** : 
    - Fichier `.env.local` pour `AIRTABLE_API_KEY` et `AIRTABLE_BASE_ID`.
    - Validation des entrées (Zod) côté serveur.
    - Gestion des erreurs API (Rate limits).
4. **Structure** : Dossiers clairs (`/components`, `/pages`, `/lib/airtable.js`).

## 🎨 UX / UI Designer (UX_UI.md)

**Objectif Principal** : Concevoir une interface simple, lisible et utilisable sur tablette par le staff en service.

**Directives :**
1. **Priorité Mobile/Tablette** : Boutons assez gros pour le tactile.
2. **Vues Obligatoires** :
    - **Liste** : Tableau dense mais lisible. Colonnes triables.
    - **Kanban** : Colonnes "À venir" (is_here=0) / "Arrivé" (is_here=1). Drag & Drop intuitif ou menu contextuel.
    - **Planning** : Vue calendaire (jour/semaine).
3. **Composants Clés** :
    - Carte de réservation (Nom, Heure, Nb Pers).
    - Indicateur visuel "Arrivé" (Vert/Coché).
    - Formulaire d'ajout rapide (Modal ou page dédiée).
    - Messages de succès/erreur non intrusifs (Toasts).

## 💻 Développeur Full Stack (Dev_Full_Stack.md)

**Objectif Principal** : Implémenter les fonctionnalités V0 (CRUD + Vues) en respectant les specs.

**Directives :**
1. **Intégration Airtable** :
    - Utiliser `airtable` (npm install airtable).
    - Mapper les champs CSV (`heure_arrivee`, etc.) vers l'objet JSON.
    - Gérer la conversion de date : `DD/MM/YYYY` (CSV) <-> ISO (API).
2. **Fonctionnalités** :
    - **CRUD** complet via API interne.
    - **État** de l'application (React Query / SWR / Context) pour la fluidité.
    - **Routing** simple pour basculer entre les vues (`/list`, `/kanban`, `/planning`).
3. **Qualité Code** :
    - Typer les données si possible (TypeScript ou JSDoc).
    - Pas de `console.log` de données sensibles.
    - Commentaires sur la logique de parsing date.

## ✅ QA / Recette (Checklist pour tous)

**Avant de "Mettre en Prod" (ou considérer comme Terminé) :**
- [ ] Vérifier que la clé API n'est PAS visible dans l'onglet Network du navigateur (sauf appel vers backend interne).
- [ ] Tester la création d'une réservation avec des caractères spéciaux.
- [ ] Vérifier le comportement si Airtable est lent ou hors ligne (Message d'erreur ?).
- [ ] Valider que le Planning affiche correctement les créneaux horaires.

