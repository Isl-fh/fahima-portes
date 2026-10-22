/* Session FAHIMA PORTES — état de connexion partagé par toutes les pages.
   - Initialise Firebase (Auth + Firestore) une seule fois.
   - Met à jour l'en-tête : « Se connecter » est remplacé par une icône
     de bonhomme anonyme (aucun nom affiché) quand un client est connecté.
   - Diffuse l'événement « fh:user » (detail.user) à chaque changement. */
import { firebaseConfig } from "./firebase-config.js";

export const session = {
  pret: false,     // Firebase prêt
  user: null,      // utilisateur connecté (ou null)
  fb: null,        // module firebase-auth
  fstore: null,    // module firebase-firestore
  auth: null,
  db: null
};

/* stockage peut être indisponible (cadre restreint, navigation privée) :
   on bascule alors sur un stockage en mémoire sans faire planter la page. */
let stockageLocal = false;
const stockage = (() => {
  try {
    const t = window.localStorage;
    t.setItem("__fh_test", "1");
    t.removeItem("__fh_test");
    stockageLocal = true;
    return t;
  } catch {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }
})();
session.stockageLocal = stockageLocal;

const configure = firebaseConfig.apiKey && firebaseConfig.apiKey !== "A_REMPLIR";
const quand = demarrer();
session.quand = quand;

function memoriser(user) {
  // Conserve prénom / contact pour préremplir le formulaire de devis.
  if (!window.FH) return;
  if (!user) { FH.ecrire("fh-user", "null"); return; }
  var prenom = (user.displayName || "").split(" ")[0] || "";
  var nom = (user.displayName || "").split(" ").slice(1).join(" ");
  var vraiEmail = user.email && user.email.indexOf("@tel.") === -1 ? user.email : "";
  FH.ecrire("fh-user", JSON.stringify({ prenom: prenom, nom: nom, email: vraiEmail, telephone: user.phoneNumber || "" }));
}

function majEnTete(user) {
  document.querySelectorAll(".account-link").forEach(function (a) {
    var span = a.querySelector("[data-account-label]");
    if (user) {
      a.classList.add("connecte");
      if (span) span.hidden = true;
      if (!a.querySelector(".compte-icone")) {
        var icone = document.createElement("span");
        icone.className = "compte-icone";
        icone.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 1.5c-4.4 0-8 2.4-8 5.3V20h16v-1.2c0-2.9-3.6-5.3-8-5.3Z"/></svg>';
        a.appendChild(icone);
      }
    } else {
      a.classList.remove("connecte");
      var icone = a.querySelector(".compte-icone");
      if (icone) icone.remove();
      if (span) {
        span.hidden = false;
        if (window.FH) span.textContent = FH.t("nav.login");
      }
    }
  });
}

async function demarrer() {
  if (!configure) return;
  const v = "10.12.2";
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  session.fb = A;
  session.fstore = F;
  session.auth = A.getAuth(app);
  /* Persistance : locale si le stockage du navigateur est disponible,
     sinon en mémoire (cadre restreint, navigation privée) — sinon la
     connexion elle-même échoue avec une SecurityError. */
  try {
    await A.setPersistence(session.auth, stockageLocal ? A.browserLocalPersistence : A.inMemoryPersistence);
  } catch (e) { console.warn("Persistance Firebase indisponible", e); }
  session.db = F.getFirestore(app);
  if (window.FH) session.auth.languageCode = FH.etat.lang;
  document.addEventListener("fh:change", function () {
    if (session.auth && window.FH) session.auth.languageCode = FH.etat.lang;
  });
  A.onAuthStateChanged(session.auth, function (u) {
    session.user = u;
    memoriser(u);
    majEnTete(u);
    document.dispatchEvent(new CustomEvent("fh:user", { detail: { user: u } }));
  });
  session.pret = true;
}

quand.catch(function (e) { console.error("Session Firebase indisponible.", e); });

/* Vérifie si l'utilisateur courant est administrateur.
   La collection s'appelle « Admins » dans Firebase (avec un A majuscule) ;
   « admins » (minuscule) reste acceptée pour compatibilité. */
export async function verifierAdmin(user) {
  if (!user || !session.fstore || !session.db) return { admin: false, erreur: null };
  for (const col of ["Admins", "admins"]) {
    try {
      const s = await session.fstore.getDoc(session.fstore.doc(session.db, col, user.uid));
      if (s.exists()) {
        const role = s.data() && s.data().role;
        if (!role || role === "admin") return { admin: true, erreur: null };
      }
    } catch (e) {
      // Lecture refusée (règles de sécurité) : à signaler clairement.
      return { admin: false, erreur: e };
    }
  }
  return { admin: false, erreur: null };
}
