# OpenFood

Une application mobile de suivi nutritionnel permettant de scanner et enregistrer vos repas avec analyse nutritionnelle en temps réel.

## Fonctionnalités

- Authentification sécurisée - Inscription et connexion via Clerk
- Scan de codes-barres - Scannez les codes-barres des produits pour récupérer automatiquement les informations nutritionnelles
- Gestion des repas - Enregistrez et organisez vos repas par type (petit-déjeuner, déjeuner, dîner, snack)
- Suivi nutritionnel - Visualisez les calories, protéines, glucides et lipides de chaque aliment
- Objectifs journaliers - Définissez et suivez votre objectif calorique quotidien avec une barre de progression
- Nutriscore - Consulter le Nutriscore (A-E) de chaque produit avec codes couleur
- Historique - Consultez vos repas passés triés par date
- Design moderne - Interface utilisateur élégante avec palette de couleurs cohérente

## Prérequis

- Node.js >= 18.0
- npm ou yarn
- Expo CLI installé globalement (`npm install -g expo-cli`)
- Un appareil mobile ou un émulateur (iOS/Android)
- Une clé API Clerk (gratuit sur https://clerk.com)

## Installation et Configuration

### 1. Cloner le repository

```bash
git clone https://github.com/Mathys3005/openfood.git
cd openfood
```

### 2. Installer les dépendances

```bash
npm install
```

Vous pouvez aussi utiliser yarn si vous le préférez:
```bash
yarn install
```

### 3. Configurer les variables d'environnement

Le projet nécessite une clé Clerk pour l'authentification.

Créez d'abord le fichier `.env.local` en copiant le template :

```bash
cp sample.env .env.local
```

Puis ouvrez `.env.local` et remplissez votre clé Clerk :

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CLERK_KEY_HERE
```

Pour obtenir votre clé Clerk :
1. Allez sur https://dashboard.clerk.com
2. Créez une application (ou sélectionnez la vôtre)
3. Allez dans "API Keys"
4. Copiez la clé "Publishable Key"
5. Collez-la dans `.env.local`

## Démarrage

### Avec Expo Go

```bash
# Démarrer le serveur de développement
npm start
```

Scannez le code QR avec l'app Expo Go sur votre téléphone.

### Sur un émulateur Android
```bash
npm run android
```

### Sur un émulateur iOS (macOS uniquement)
```bash
npm run ios
```

### Sur le web
```bash
npm run web
```

## Structure du Projet

```
openfood/
├── app/
│   ├── (auth)/                      # Écrans d'authentification
│   │   ├── _layout.tsx              # Layout pour les écrans auth
│   │   ├── login.tsx                # Écran de connexion
│   │   └── signup.tsx               # Écran d'inscription
│   │
│   ├── (main)/                      # Écrans principaux (accessibles après auth)
│   │   ├── _layout.tsx              # Navigation principale (tabs)
│   │   ├── profile.tsx              # Profil utilisateur et paramètres
│   │   │
│   │   ├── (home)/                  # Section accueil et détails
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx            # Liste de tous les repas du jour/semaine
│   │   │   └── [id].tsx             # Détails complets d'un repas spécifique
│   │   │                            # (calories, nutrition, aliments scannés)
│   │   │
│   │   └── add/                     # Section ajout de repas
│   │       ├── _layout.tsx
│   │       ├── index.tsx            # Recherche et sélection d'aliments
│   │       │                        # (récupère depuis OpenFacts API)
│   │       └── camera.tsx           # Scanner de codes-barres
│   │                                # (intégration avec expo-camera)
│   │
│   └── _layout.tsx                  # Layout racine avec authentification
│
├── assets/                          # Images, icônes et ressources statiques
│
├── components/                      # Composants réutilisables
│   └── sign-out-button.tsx         # Bouton de déconnexion
│
├── types/                           # Types TypeScript pour type-safety
│   ├── food.type.ts                 # Type pour un aliment
│   ├── meal.type.ts                 # Type pour un repas complet
│   └── mealType.type.ts            # Type pour les catégories de repas
│
├── tools/                           # Utilitaires et helpers
│   └── debounce.jsx                 # Hook debounce pour la recherche
│
├── package.json                     # Dépendances et scripts
├── tsconfig.json                    # Configuration TypeScript
├── app.json                         # Configuration Expo
├── README.md                        # Cette documentation
├── sample.env                       # Template des variables d'env
├── .env.local                       # Variables d'environnement (local, pas versionné)
└── .gitignore                       # Fichiers à ignorer

```

## Variables d'Environnement

Le fichier `.env.local` contient les secrets qui ne doivent pas être versionnés.

Actuellement utilisé:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clé publique pour Clerk auth

Important: C'est un fichier local et n'est jamais committé. Chaque développeur doit avoir son propre `.env.local`

