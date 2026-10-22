// Configuration Firebase de FAHIMA PORTES.
// Remplacez les valeurs ci-dessous par celles de votre projet Firebase
// (Console Firebase > Paramètres du projet > Vos applications > Configuration du SDK).
// Tant que "apiKey" vaut "A_REMPLIR", l'espace client affiche « en cours d'activation ».
export const firebaseConfig = {
  apiKey: "A_REMPLIR",
  authDomain: "A_REMPLIR.firebaseapp.com",
  projectId: "A_REMPLIR",
  appId: "A_REMPLIR"
};

// Domaine technique utilisé pour associer un mot de passe aux comptes créés par téléphone.
export const DOMAINE_TEL = "tel.fh-portes.com";

// Inscription / connexion par téléphone (SMS) : désactivée dans cette version.
// L'activer suppose un plan Firebase payant et des tests complets (envoi de code,
// connexion, récupération). Ne passer à true qu'après ces tests.
export const TEL_ACTIF = false;
