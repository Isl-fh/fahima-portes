# Guide d'installation — Espace client + Administration du catalogue

Ce guide explique comment activer la création de comptes clients et la gestion
du catalogue (ajouter des offres, changer les prix et les descriptions) pour le
site FAHIMA PORTES. Le plan Firebase « Spark » couvre le besoin actuel
(e-mail/mot de passe et Firestore) ; l'inscription par SMS, elle, demande un
plan payant et reste désactivée dans cette version.

## Ce qui a été construit

- **Espace client** (`compte.html`) : création de compte et connexion par e-mail
  (le téléphone par SMS est prévu mais demande une configuration payante — à activer plus tard).
- **Administration** (`admin.html`) : réservée aux comptes administrateurs, elle permet de :
  - ajouter une nouvelle offre (nom, description, prix, catégories, image) ;
  - modifier le prix et les descriptions d'une offre ;
  - masquer ou afficher une offre ;
  - supprimer une offre ;
  - importer en un clic les 8 modèles actuels comme point de départ.
- **Catalogue public** (`catalogue.html`) : affiche les offres enregistrées dans
  la base, dans les 3 langues. La page lit la base à chaque chargement : un
  visiteur voit vos modifications en actualisant la page (pas d'écoute en temps
  réel).

## Étape 1 — Créer le projet Firebase

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
valeurs copiées à l'étape 2.

Important : faites d'abord valider le raccordement et les tests (inscription,
droits administrateur, enregistrement d'offres) **sur un aperçu du site**,
avant toute mise en ligne. La fusion de la branche `refonte` dans `main` —
qui met à jour le site en ligne — est une décision séparée, à prendre
uniquement après ces tests.

## Étape 7 — Créer votre compte administrateur

1. Ouvrez la page **Mon compte** — sur l'aperçu du site tant que la nouvelle
   version n'est pas publiée, ou sur le site en ligne après publication — et
   créez votre compte avec votre e-mail personnel.
2. Dans la console Firebase : **Authentication > Utilisateurs**, et copiez
   l'**UID** de votre compte (colonne « UID utilisateur »).
3. Dans **Firestore Database**, ouvrez la collection `admins` (déjà créée)
   et cliquez **« Ajouter un document »** :
   - ID du document : **collez votre UID**
   - Champ : `role`, valeur : `admin`
4. C'est tout. Pour ajouter un autre administrateur plus tard, refaites
   l'étape 7 avec son compte.

## Étape 8 — Importer le catalogue et gérer les offres

1. Connectez-vous sur la page d'administration (`admin.html` — via le bouton
   **Administration** dans votre espace client). Tant que la nouvelle version
   n'est pas publiée, faites-le sur l'aperçu ; l'adresse
   `www.fh-portes.com/admin.html` fonctionnera après publication.
2. Les 8 modèles actuels ont **déjà été importés** dans la base lors des tests :
   le bouton « Importer le catalogue actuel » ne s'affiche plus, c'est normal.
   (S'il s'affichait malgré tout, cliquer dessus ne modifierait rien : l'import
   n'écrase jamais les offres existantes.)
3. Vous pouvez maintenant **ajouter des offres**, **changer les prix**,
   **modifier les descriptions** (français obligatoire ; arabe et anglais
   facultatifs — le français sert de repli), **masquer** ou **supprimer**.

## Notes importantes

- Les prix sont saisis **en euros** ; le site convertit automatiquement
  en dinars pour les visiteurs.
- Pour la photo d'une nouvelle offre : indiquez le nom d'une image du site
  (ex. `produit-10.webp`, à envoyer au préalable dans le dépôt GitHub) ou une
  adresse `https://...` complète.
- Les modifications apparaissent sur le catalogue lors du chargement de la
  page (le visiteur doit actualiser sa page).
- L'inscription par SMS (téléphone) nécessite un plan payant Firebase et la
  saisie d'une carte bancaire : elle est désactivée dans cette version et ne
  doit être activée qu'après tests complets (envoi de code, connexion,
  récupération).
- Les règles de sécurité du fichier `firestore.rules` doivent être publiées
  dans la console Firebase (étape 4) : leur simple présence dans le dépôt ne
  protège rien tant qu'elles n'y sont pas collées et publiées.

## Nettoyage des comptes de test (avant la mise en ligne)

Deux comptes temporaires ont été créés pour la validation :

1. Dans **Firestore Database > admins**, supprimez le document
   `CKOHYbamr8YocQW5iblT47bpr0l1` (compte de test administrateur). Ne vous
   contentez pas de modifier son champ `role` : tant que le document existe,
   le compte garde ses droits.
2. Dans **Authentication > Utilisateurs**, supprimez `test-qa@fahima-portes.com`
   et `test-qa2@fahima-portes.com`.

À faire uniquement après avoir créé votre propre compte administrateur
   (étape 7) et vérifié que vous accédez bien à l'administration.
