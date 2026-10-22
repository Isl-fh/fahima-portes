# Guide d'installation — Espace client + Administration du catalogue

Ce guide explique comment activer la création de comptes clients et la gestion
du catalogue (ajouter des offres, changer les prix et les descriptions) pour le
site FAHIMA PORTES. Tout est gratuit avec le plan Firebase « Spark ».

## Ce qui a été construit

- **Espace client** (`compte.html`) : création de compte et connexion par e-mail
  (le téléphone par SMS est prévu mais demande une configuration payante — à activer plus tard).
- **Administration** (`admin.html`) : réservée aux comptes administrateurs, elle permet de :
  - ajouter une nouvelle offre (nom, description, prix, catégories, image) ;
  - modifier le prix et les descriptions d'une offre ;
  - masquer ou afficher une offre ;
  - supprimer une offre ;
  - importer en un clic les 8 modèles actuels comme point de départ.
- **Catalogue public** (`catalogue.html`) : affiche automatiquement les offres
  enregistrées dans la base (les plus récentes), dans les 3 langues.

## Étape 1 — Créer le projet Firebase (5 minutes, gratuit)

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
   et connectez-vous avec un compte Google.
2. Cliquez sur **« Créer un projet »**, nommez-le par exemple `fahima-portes`,
   puis **Continuer** (Google Analytics optionnel).

## Étape 2 — Ajouter le site au projet

1. Sur la page d'accueil du projet, cliquez sur l'icône **</>** (Web).
2. Nommez l'application `fahima-portes` puis **Enregistrer l'application**.
3. Firebase affiche un bloc `firebaseConfig` avec des valeurs
   (`apiKey`, `authDomain`, `projectId`, `appId`...). **Copiez ces valeurs** :
   elles seront collées dans le fichier `assets/firebase-config.js` du site.

## Étape 3 — Activer la connexion par e-mail

1. Dans le menu : **Authentication > Sign-in method** (Commencer).
2. Activez **E-mail/Mot de passe** (laissez « Lien e-mail » désactivé).

## Étape 4 — Créer la base de données Firestore

1. Menu : **Firestore Database > Créer une base de données**.
2. Choisissez une région proche (par ex. `europe-west1`), mode **Production**.
3. Ouvrez l'onglet **Règles**, supprimez le contenu et collez le fichier
   `firestore.rules` fourni avec le site, puis **Publier**.

## Étape 5 — Autoriser le domaine du site

1. Menu : **Authentication > Paramètres > Domaines autorisés**.
2. Ajoutez `www.fh-portes.com` et `fh-portes.com`.
   (Pour tester avant la mise en ligne, ajoutez aussi le domaine de l'aperçu.)

## Étape 6 — Relier le site

Ouvrez `assets/firebase-config.js` et remplacez chaque `A_REMPLIR` par les
valeurs copiées à l'étape 2, puis mettez le site à jour (fusion de la branche
`refonte` dans `main` sur GitHub).

## Étape 7 — Créer votre compte administrateur

1. Sur le site en ligne, ouvrez la page **Mon compte** et créez votre compte
   avec votre e-mail personnel.
2. Dans la console Firebase : **Authentication > Utilisateurs**, et copiez
   l'**UID** de votre compte (colonne « UID utilisateur »).
3. Dans **Firestore Database**, cliquez **« Démarrer une collection »** :
   - ID de collection : `admins`
   - ID du document : **collez votre UID**
   - Champ : `role`, valeur : `admin`
4. C'est tout. Pour ajouter un autre administrateur plus tard, refaites
   l'étape 7 avec son compte.

## Étape 8 — Importer le catalogue et gérer les offres

1. Connectez-vous sur `www.fh-portes.com/admin.html` (ou via le bouton
   **Administration** dans votre espace client).
2. Cliquez sur **« Importer le catalogue actuel »** : les 8 modèles entrent
   dans la base. Ce bouton disparaît ensuite.
3. Vous pouvez maintenant **ajouter des offres**, **changer les prix**,
   **modifier les descriptions** (français obligatoire ; arabe et anglais
   facultatifs — le français sert de repli), **masquer** ou **supprimer**.

## Notes importantes

- Les prix sont saisis **en euros** ; le site convertit automatiquement
  en dinars pour les visiteurs.
- Pour la photo d'une nouvelle offre : indiquez le nom d'une image du site
  (ex. `produit-10.webp`, à envoyer au préalable dans le dépôt GitHub) ou une
  adresse `https://...` complète.
- Les modifications apparaissent immédiatement sur le catalogue du site.
- L'inscription par SMS (téléphone) nécessite un plan payant Firebase et la
  saisie d'une carte bancaire : elle reste désactivée tant que vous ne l'avez
  pas configurée.
