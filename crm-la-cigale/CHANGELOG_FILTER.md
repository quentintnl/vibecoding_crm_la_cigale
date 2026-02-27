# 📝 Changelog - Filtrage des Réservations Passées

**Date** : 25 Février 2026  
**Modification** : Masquer les réservations antérieures à aujourd'hui

---

## 🎯 Objectif

Ne plus afficher les réservations passées dans les vues Liste, Kanban et Planning pour :
- Réduire le bruit visuel
- Se concentrer sur les réservations à venir
- Améliorer la performance (moins de données à afficher)

---

## ✅ Modifications Appliquées

### 1. Vue Liste (`app/liste/page.tsx`)

**Avant** :
```typescript
const { reservations, isLoading, isError, mutate } = useReservations();
// Affichait TOUTES les réservations
```

**Après** :
```typescript
const { reservations, isLoading, isError, mutate } = useReservations();
// Filtrer les réservations pour ne montrer que celles d'aujourd'hui et futures
const today = format(new Date(), 'yyyy-MM-dd');
const filteredReservations = reservations?.filter(r => r.date >= today) || [];
```

**Impact** :
- ✅ Seules les réservations >= date du jour sont affichées
- ✅ Le compteur affiche "X réservation(s) à venir"
- ✅ Le tableau utilise `filteredReservations.map()`

---

### 2. Vue Kanban (`app/kanban/page.tsx`)

**Avant** :
```typescript
const reservationsAVenir = reservations?.filter(r => r.statut === 'A_VENIR') || [];
const reservationsArrivees = reservations?.filter(r => r.statut === 'ARRIVE') || [];
```

**Après** :
```typescript
// Filtrer d'abord par date
const today = format(new Date(), 'yyyy-MM-dd');
const futureReservations = reservations?.filter(r => r.date >= today) || [];

// Puis séparer par statut
const reservationsAVenir = futureReservations.filter(r => r.statut === 'A_VENIR');
const reservationsArrivees = futureReservations.filter(r => r.statut === 'ARRIVE');
```

**Impact** :
- ✅ Les colonnes ne montrent que les réservations futures
- ✅ Les compteurs de badges sont ajustés

---

### 3. Vue Planning (`app/planning/page.tsx`)

**Avant** :
```typescript
const getReservationsForDay = (day: Date): Reservation[] => {
  if (!reservations) return [];
  return reservations.filter(r => { /* ... */ });
};
```

**Après** :
```typescript
// Filtrer en amont
const today = format(new Date(), 'yyyy-MM-dd');
const futureReservations = reservations?.filter(r => r.date >= today) || [];

const getReservationsForDay = (day: Date): Reservation[] => {
  return futureReservations.filter(r => { /* ... */ });
};
```

**Impact** :
- ✅ Le calendrier affiche uniquement les jours avec réservations futures
- ✅ Les jours passés apparaissent vides

---

## 🧪 Tests à Effectuer

### Scénario 1 : Réservations du jour
```
Date du jour : 25/02/2026
Réservation : 25/02/2026 à 19h30
Résultat attendu : ✅ Visible (date >= aujourd'hui)
```

### Scénario 2 : Réservations passées
```
Date du jour : 25/02/2026
Réservation : 16/01/2026 à 19h30
Résultat attendu : ❌ Masquée (date < aujourd'hui)
```

### Scénario 3 : Réservations futures
```
Date du jour : 25/02/2026
Réservation : 15/03/2026 à 20h00
Résultat attendu : ✅ Visible (date > aujourd'hui)
```

---

## 💡 Logique de Comparaison

```typescript
const today = format(new Date(), 'yyyy-MM-dd'); // "2026-02-25"
const reservation.date = "2026-03-15"; // Format ISO

if (reservation.date >= today) {
  // ✅ Afficher
} else {
  // ❌ Masquer
}
```

**Avantages de la comparaison ISO** :
- Format `YYYY-MM-DD` est comparable directement avec `>=`
- Pas besoin de convertir en objet Date
- Performance optimale

---

## 🔄 Comportement Dynamique

Le filtre est **dynamique** et s'ajuste automatiquement :
- **Aujourd'hui** : Réservations du jour + futures visibles
- **Demain** : Les réservations d'aujourd'hui deviennent invisibles
- **Pas de stockage** : Recalculé à chaque chargement de page

---

## 📊 Impact sur les Données

### Ce qui est masqué
- ❌ Réservations avec `date < aujourd'hui`
- ✅ Les données existent toujours dans Airtable
- ✅ Aucune suppression

### Ce qui est visible
- ✅ Réservations du jour même
- ✅ Réservations futures
- ✅ Tous les statuts (À venir ET Arrivé)

---

## 🚀 Évolutions Possibles (V1)

### Option 1 : Toggle "Afficher historique"
Ajouter un bouton pour basculer entre :
- Mode par défaut : Futures uniquement
- Mode historique : Toutes les réservations

### Option 2 : Filtres avancés
```typescript
// Dernières 7 jours + futures
const cutoffDate = subDays(new Date(), 7);

// Ou : Période personnalisée
const filteredReservations = reservations?.filter(r => {
  const resDate = new Date(r.date);
  return resDate >= startDate && resDate <= endDate;
});
```

### Option 3 : Archive automatique
Déplacer les réservations passées vers une table "Historique" dans Airtable

---

## ✅ Validation

Pour tester que le filtre fonctionne :

1. Ouvrez l'application : `npm run dev`
2. Créez une réservation avec une date passée dans Airtable directement
3. Rechargez la vue Liste → Elle ne devrait PAS apparaître
4. Créez une réservation avec la date d'aujourd'hui → Elle apparaît ✅
5. Créez une réservation future → Elle apparaît ✅

---

**Implémenté par** : Agent Dev Full-Stack  
**Date** : 25 Février 2026  
**Statut** : ✅ Déployé dans les 3 vues

