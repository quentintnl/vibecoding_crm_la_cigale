# 🎯 Guide de Configuration Rapide

## Étape 1 : Obtenir vos identifiants Airtable

### 1.1 Créer un Personal Access Token (PAT)

1. Rendez-vous sur : https://airtable.com/create/tokens
2. Cliquez sur "Create new token"
3. Donnez un nom au token : `CRM La Cigale`
4. Cochez les scopes suivants :
   - ✅ `data.records:read`
   - ✅ `data.records:write`
5. Dans "Access", ajoutez votre base :
   - Cliquez sur "Add a base"
   - Sélectionnez votre base de réservations
6. Cliquez sur "Create token"
7. **COPIEZ LE TOKEN** (vous ne pourrez plus le voir après)
   - Format : `patXXXXXXXXXXXXXX.YYYYYYYYYYYYYYYY`

### 1.2 Obtenir le Base ID

1. Ouvrez votre base Airtable dans le navigateur
2. Regardez l'URL : `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copiez la partie commençant par `app` (17 caractères)
   - Format : `appXXXXXXXXXXXXXX`

### 1.3 Vérifier le nom de la table

1. Dans votre base Airtable, vérifiez le nom exact de votre table
2. Par défaut : `Reservations` (avec majuscule et sans accent)

## Étape 2 : Configurer l'application

### 2.1 Ouvrir le fichier .env.local

```bash
# Sur Windows
notepad .env.local

# Sur Mac/Linux
nano .env.local
```

### 2.2 Remplacer les valeurs

```env
AIRTABLE_PAT=patXXXXXXXXXXXXXX.YYYYYYYYYYYYYYYY
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Reservations
```

⚠️ **IMPORTANT** :
- Pas d'espaces autour du `=`
- Pas de guillemets
- Remplacez les `XXX` par vos vraies valeurs

### 2.3 Sauvegarder le fichier

## Étape 3 : Vérifier le schéma Airtable

Votre table Airtable doit avoir exactement ces champs :

| Nom du champ (EXACT) | Type | Requis |
|----------------------|------|--------|
| `heure_arrivee` | Single line text | ✅ |
| `date_reservation` | Date | ✅ |
| `nom_client` | Single line text | ✅ |
| `nombre_personnes` | Number | ✅ |
| `numero_telephone` | Single line text | ❌ |
| `champ_complementaire` | Long text | ❌ |
| `is_here` | Number | ✅ |

### ⚠️ Points d'attention

- Les noms de champs doivent être **EXACTEMENT** comme indiqué (avec underscores)
- Le champ `is_here` doit être un **Number** (pas un Checkbox)
- Le format de date doit être `DD/MM/YYYY` (ex: 16/01/2026)
- L'heure peut être `19h30` ou `19:30`

## Étape 4 : Tester en local

```bash
npm run dev
```

Ouvrez http://localhost:3000

### Tests à effectuer

1. ✅ La page se charge sans erreur
2. ✅ Vous êtes redirigé vers `/liste`
3. ✅ Les réservations existantes s'affichent
4. ✅ Créez une nouvelle réservation
5. ✅ Vérifiez qu'elle apparaît dans Airtable
6. ✅ Modifiez une réservation
7. ✅ Marquez un client présent
8. ✅ Testez la vue Kanban
9. ✅ Testez la vue Planning

## 🚨 Dépannage

### Erreur "Configuration Airtable manquante"

**Cause** : Le fichier `.env.local` n'existe pas ou les variables ne sont pas définies

**Solution** :
```bash
# Vérifiez que le fichier existe
ls .env.local

# Si absent, copiez l'exemple
cp .env.example .env.local
```

### Erreur "401 Unauthorized"

**Cause** : Le token Airtable est invalide ou n'a pas les bons scopes

**Solution** :
1. Vérifiez que votre PAT est valide sur https://airtable.com/create/tokens
2. Vérifiez que les scopes `data.records:read` et `data.records:write` sont activés
3. Vérifiez que la base est bien ajoutée dans "Access"

### Erreur "404 Not Found"

**Cause** : Le Base ID ou le nom de la table est incorrect

**Solution** :
1. Vérifiez votre `AIRTABLE_BASE_ID` (17 caractères commençant par `app`)
2. Vérifiez `AIRTABLE_TABLE_NAME` (respecte la casse : `Reservations` avec majuscule)

### Rien ne s'affiche dans la liste

**Cause** : La table est vide ou les noms de champs ne correspondent pas

**Solution** :
1. Vérifiez dans Airtable que vous avez des données
2. Vérifiez que les noms de champs correspondent exactement (voir Étape 3)
3. Regardez la console navigateur (F12) pour les erreurs

### Erreur "Type 'Promise<{ id: string }>' is not assignable..."

**Cause** : Version Next.js 15+ avec params async

**Solution** : Déjà corrigé dans le code ! Si l'erreur persiste :
```bash
npm install next@latest
```

## 📞 Besoin d'aide ?

1. Vérifiez d'abord le fichier `README.md`
2. Consultez `TECHNICAL.md` pour les détails d'implémentation
3. Regardez les logs de la console (F12 dans le navigateur)
4. Contactez le développeur avec :
   - Le message d'erreur exact
   - Le screenshot de l'erreur
   - Les logs console (F12)

---

**Prêt pour la production ?** → Consultez `DEPLOYMENT.md` (section Vercel)

