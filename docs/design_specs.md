# Design Specs — CRM Réservations La Cigale

## 1. Objectifs UI & Design
- **Lisibilité immédiate** : Permettre au staff de scanner les réservations en un coup d'œil (Nom, Heure, Couverts).
- **Réduction de la charge cognitive** : Masquer les détails superflus par défaut, utiliser des codes visuels constants.
- **Interface moderne et sobre** : Utiliser un style "SaaS Pro" (aéré, typographie soignée) plutôt qu'un style "Admin brut".

## 2. Principes de design
- **Hiérarchie visuelle claire** :
    - **Niveau 1 (Titres)** : Nom du client, Heure d'arrivée.
    - **Niveau 2 (Métadonnées)** : Nombre de personnes, Statut, Date.
    - **Niveau 3 (Secondaire)** : Téléphone, Notes (champ complémentaire).
- **Couleurs = information** : La couleur n'est utilisée que pour indiquer un état (Succès, Attention, Action) ou guider l'œil. Pas de décoration inutile.
- **Simplicité > exhaustivité** : Sur les vues listes/cartes, on affiche l'essentiel. Les détails sont accessibles au clic/survol.

## 3. Design System V0

### Palette couleur
Utilisation de la palette **Tailwind CSS**.

- **Fond**
    - Page background : `bg-slate-50` (Gris très clair, moins fatiguant que le blanc pur).
    - Surface (Cartes, Tableaux) : `bg-white` avec bordures subtiles (`border-slate-200`).
    - Surface Secondaire (Headers, Colonnes Kanban) : `bg-slate-100`.

- **Texte**
    - Principal (Titres, Données clés) : `text-slate-900`.
    - Secondaire (Labels, dates) : `text-slate-500`.
    - Tertiaire (Placeholder, inactif) : `text-slate-400`.

- **Couleur Primaire (Action & Brand)**
    - Base : `indigo-600` (Sérieux, lisible, bon contraste).
    - Hover : `indigo-700`.
    - Surface légère (fonds de sélection) : `indigo-50`.

- **Couleurs d’état (Statuts)**
    - **Neutre / À venir** : `slate-100` (Fond) + `slate-700` (Texte) ou `blue-50` + `blue-700`.
    - **Succès / Arrivé** : `emerald-50` (Fond) + `emerald-700` (Texte).
    - **Warning / Note importante** : `amber-50` (Fond) + `amber-700` (Texte).
    - **Danger / Annulé** : `red-50` (Fond) + `red-700` (Texte).

### Typographie
- **Police** : Sans-serif système (`Inter`, `system-ui`, etc. via Tailwind `font-sans`).
- **Tailles et usages** :
    - `text-xs` : Labels, métadonnées secondaires.
    - `text-sm` : Corps de texte standard, contenu de table.
    - `text-base` : Titres de cartes, noms clients importants.
    - `text-lg` / `text-xl` : Titres de page, KPI.
    - `font-medium` ou `font-semibold` pour les données clés (Noms, Heures), `font-normal` pour le reste.

### Espacements & Layout
- **Padding standard** :
    - Structure page : `p-4` (mobile), `p-6` ou `p-8` (desktop).
    - Interne (Cartes) : `p-4`.
    - Cellules table : `px-4 py-3`.
- **Grilles** : Gap standard de `gap-4` ou `gap-6`.
- **Rayon de bordure (Radius)** : `rounded-md` (standard) ou `rounded-lg` (pour les conteneurs principaux). Soyons cohérents.
- **Ombres** : `shadow-sm` pour les cartes/tables (léger relief), `shadow-md` au survol ou pour les éléments flottants.

## 4. Amélioration UI — Vue Liste
### Hiérarchie des informations
Ne pas traiter toutes les colonnes à égalité.
- **Mise en avant** : Heure, Nom Client.
- **Secondaire** : Nombre de personnes (badge), Statut.
- **Tertiaire** : Téléphone, Notes (icones ou texte tronqué).

### Style de table
- Abandonner le style "Excel".
- Utiliser un design aéré :
    - Header : `bg-slate-50`, texte `text-xs font-semibold text-slate-500 uppercase tracking-wider`.
    - Lines : `border-b border-slate-200`, `hover:bg-slate-50` (au survol).
    - Cellule "Nom" : `font-medium text-slate-900`.

### Badges & Statuts
- **Statut "Arrivé"** : Badge `emerald` (`bg-emerald-100 text-emerald-800`).
- **Nb Personnes** : Badge neutre rond ou pill (`bg-slate-100 text-slate-700 font-medium`).

### Actions utilisateur
- Boutons d'action (Edit, Delete, Arrivé) groupés en fin de ligne.
- Utiliser des icônes (Heroicons) pour alléger : `Pencil`, `Trash` (couleur `text-slate-400 hover:text-red-600` pour delete).
- Bouton principal "Nouveau" bien visible en haut à droite.

## 5. Amélioration UI — Vue Kanban
### Colonnes
- Fond de colonne : `bg-slate-100/50` ou `bg-slate-50` avec bordure.
- Header de colonne : Sticky, avec compteur de cartes (ex: "À venir (12)").

### Cartes
- Style : `bg-white p-3 rounded-md shadow-sm border border-slate-200`.
- **Contenu** :
    1.  **Top** : Heure (Badge ou Gras) + Icône personne (`Users`) avec nb.
    2.  **Middle** : Nom du client (Gras, `text-slate-900`).
    3.  **Bottom** : Note éventuelle (icône info) ou Tel.
- Hover : `hover:shadow-md hover:border-indigo-300` (feedback interactif).

### Drag & Drop Feedback
- Carte en mouvement : Opacité réduite, rotation légère.
- Zone de drop : `bg-indigo-50 border-2 border-dashed border-indigo-300`.

### États Vides (Empty States)
- Si une colonne est vide, afficher un message discret ("Aucun client en attente") avec une illustration ou icône simple en gris clair.

## 6. Amélioration UI — Vue Planning
### Lisibilité temporelle
- Grille horaire claire (lignes horizontales).
- Marqueurs d'heure visibles sur le côté gauche.

### Blocs de réservation
- Carte compacte dans la grille.
- Afficher uniquement : **Heure - Nom (Nb Pers)**.
- Couleur de fond selon statut :
    - À venir : `bg-blue-100 border-blue-200 text-blue-800`.
    - Arrivé : `bg-emerald-100 border-emerald-200 text-emerald-800`.

### Gestion de la densité
- Si trop de réservations sur un créneau, empiler proprement ou réduire la hauteur, mais garder le nom lisible.

## 7. Composants UI réutilisables (Specs techniques)

- **Button**
    - Primary : `bg-indigo-600 text-white hover:bg-indigo-700 rounded-md px-4 py-2 text-sm font-medium shadow-sm`.
    - Secondary : `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50`.
    - Danger : `text-red-600 hover:bg-red-50`.

- **Input / Select**
    - Base : `block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`.

- **Card**
    - Container : `bg-white overflow-hidden shadow rounded-lg border border-slate-200`.
    - Header : `px-4 py-3 border-b border-gray-200 bg-gray-50`.
    - Body : `p-4`.

- **Badge**
    - Base : `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`.

## 8. États globaux & feedback visuel
- **Loading** : Skeleton loader (blocs gris pulsants `animate-pulse bg-slate-200`) à la place des tableaux/cartes. Mieux qu'un spinner seul.
- **Success (Toast)** : Notification flottante (bas droite ou haut centre) verte lors d'une action réussie (ex: "Réservation enregistrée").
- **Error** : Texte rouge sous les champs de formulaire invalides. Toast rouge pour erreur serveur.
- **Empty** : "Aucune réservation trouvée" avec un bouton CTA "Créer une réservation".

## 9. Décisions design & justifications
| Décision | Justification | Impact UX |
| :--- | :--- | :--- |
| **Monochrome + Indigo** | Éviter le "sapin de Noël". Le métier est stressant, l'interface doit être apaisante. | Réduit la fatigue visuelle. |
| **Police Inter** | Standard moderne, excellente lisibilité des chiffres (tabulaire). | Lecture rapide des heures/téléphones. |
| **Badge Statut** | Le statut est l'info la plus critique pour le service. | Identification immédiate de l'action à prendre. |
| **Skeleton Loading** | Airtable peut être lent. | Réduit la perception d'attente. |
| **Densité "Confortable"** | Les écrans tactiles (tablettes) sont souvent utilisés en restaurant. | Cibles tactiles plus faciles à atteindre. |

