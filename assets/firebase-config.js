// Configuration Firebase de FAHIMA PORTES.
// Valeurs fournies par la console Firebase (Paramètres du projet > Vos applications).
// Ce bloc est public par conception : il est inclus dans le code du site.
export const firebaseConfig = {
  apiKey: "AIzaSyAFoNLiAZsoQgP8COziLTlwj2cEOIbilcU",
  authDomain: "fahima-portes-1e1cc.firebaseapp.com",
  projectId: "fahima-portes-1e1cc",
  storageBucket: "fahima-portes-1e1cc.firebasestorage.app",
  messagingSenderId: "699697892998",
  appId: "1:699697892998:web:e95c1ea20f49778e5dcb07",
  measurementId: "G-QGFSY475NJ"
};

// Domaine technique utilisé pour associer un mot de passe aux comptes créés par téléphone.
export const DOMAINE_TEL = "tel.fh-portes.com";

// Inscription / connexion par téléphone (SMS) : désactivée dans cette version.
// L'activer suppose un plan Firebase payant et des tests complets (envoi de code,
// connexion, récupération). Ne passer à true qu'après ces tests.
export const TEL_ACTIF = false;
