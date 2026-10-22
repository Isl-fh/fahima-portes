/* Espace client FAHIMA PORTES — Firebase Authentication (e-mail ou téléphone + mot de passe) */
import { firebaseConfig, DOMAINE_TEL } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const t = (k, v) => window.FH.t(k, v);
const configure = firebaseConfig.apiKey && firebaseConfig.apiKey !== "A_REMPLIR";

// ---------- Interface ----------
let dernierMessage = null;
function message(cle, vars, type) {
  dernierMessage = cle ? { cle, vars, type } : null;
  const el = $("message");
  if (!cle) { el.hidden = true; return; }
  el.textContent = t(cle, vars);
  el.className = "alerte" + (type ? " " + type : "");
  el.hidden = false;
}

const formulaires = ["form-login", "form-signup", "form-code", "form-forgot"];
function montrer(id) {
  formulaires.forEach((f) => ($(f).hidden = f !== id));
  const onglets = id === "form-login" || id === "form-signup";
  document.querySelector(".onglets").hidden = !onglets;
  $("tab-login").setAttribute("aria-selected", String(id === "form-login"));
  $("tab-signup").setAttribute("aria-selected", String(id === "form-signup"));
}
document.querySelectorAll("[data-vue]").forEach((b) =>
  b.addEventListener("click", () => { message(null); montrer(b.dataset.vue === "signup" ? "form-signup" : "form-login"); })
);
document.querySelectorAll("[data-retour]").forEach((b) =>
  b.addEventListener("click", () => { message(null); montrer("form-login"); })
);
if (location.hash === "#inscription") montrer("form-signup");

// Bascule e-mail / téléphone dans chaque formulaire
document.querySelectorAll(".methode").forEach((groupe) => {
  const form = groupe.closest("form");
  const maj = () => {
    const parTel = form.querySelector(".methode input:checked").value === "phone";
    form.querySelectorAll(".par-email").forEach((e) => (e.hidden = parTel));
    form.querySelectorAll(".par-phone").forEach((e) => (e.hidden = !parTel));
    if (form.id === "form-signup") $("btn-signup").textContent = t(parTel ? "acc.btn.sendcode" : "acc.btn.signup");
    if (form.id === "form-forgot") $("btn-forgot-send").textContent = t(parTel ? "acc.btn.sendcode" : "acc.forgot").replace(/[?؟]\s*$/, "");
  };
  groupe.addEventListener("change", maj);
  document.addEventListener("fh:change", maj);
  maj();
});
const parTelephone = (form) => $(form).querySelector(".methode input:checked").value === "phone";

function numero(prefix) {
  const brut = $(prefix).value.replace(/[^\d]/g, "").replace(/^0+/, "");
  return brut.length >= 8 ? $(prefix + "-ind").value + brut : null;
}
const emailTel = (e164) => e164.replace("+", "") + "@" + DOMAINE_TEL;
const emailValide = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

function occupe(form, oui) {
  $(form).querySelectorAll("button[type=submit]").forEach((b) => (b.disabled = oui || !configure));
}

document.addEventListener("fh:change", () => {
  if (dernierMessage) message(dernierMessage.cle, dernierMessage.vars, dernierMessage.type);
  if (window.__fhUser) afficherTableau(window.__fhUser);
});

if (!configure) {
  $("pas-pret").hidden = false;
  formulaires.forEach((f) => occupe(f, true));
}

// ---------- Firebase ----------
let fb = null;
let fstore = null; // module Firestore (lien administration)
let auth = null;
let db = null;
let confirmation = null;
let modeCode = null; // "signup" | "reset"
let attente = null;  // données d'inscription en attente du code SMS

function codeErreur(e) {
  const c = (e && e.code) || "";
  if (c.includes("email-already-in-use") || c.includes("credential-already-in-use") || c.includes("provider-already-linked")) return "err.exists";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found") || c.includes("invalid-login")) return "err.wrong";
  if (c.includes("invalid-verification-code") || c.includes("code-expired")) return "err.code";
  if (c.includes("invalid-phone-number") || c.includes("missing-phone-number")) return "err.phone";
  if (c.includes("invalid-email")) return "err.email";
  if (c.includes("too-many-requests") || c.includes("quota-exceeded")) return "err.many";
  if (c.includes("weak-password")) return "err.pwshort";
  console.error(e);
  return "err.generic";
}

function memoriser(user) {
  if (!user) { FH.ecrire("fh-user", "null"); return; }
  const [prenom, ...reste] = (user.displayName || "").split(" ");
  const vraiEmail = user.email && !user.email.endsWith("@" + DOMAINE_TEL) ? user.email : "";
  FH.ecrire("fh-user", JSON.stringify({ prenom, nom: reste.join(" "), email: vraiEmail, telephone: user.phoneNumber || "" }));
  FH.appliquer();
}

function afficherTableau(user) {
  window.__fhUser = user;
  $("vue-auth").hidden = !!user;
  $("vue-dash").hidden = !user;
  verifierAdmin(user);
  if (!user) return;
  const prenom = (user.displayName || "").split(" ")[0] || "";
  $("dash-titre").textContent = t("acc.welcome", { name: prenom }).trim();
  const parTel = !!user.phoneNumber;
  $("dash-contact").textContent = parTel ? user.phoneNumber : user.email;
  const verifie = parTel || user.emailVerified;
  $("dash-statut").textContent = t(verifie ? "acc.verified" : "acc.unverified");
  $("dash-statut").className = verifie ? "verifie" : "attente";
  $("dash-verif").hidden = verifie;
}

async function demarrer() {
  if (!configure) return;
  const v = "10.12.2";
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`)
  ]);
  fb = A;
  fstore = F;
  const application = initializeApp(firebaseConfig);
  db = F.getFirestore(application);
  auth = A.getAuth(application);
  auth.languageCode = FH.etat.lang;
  document.addEventListener("fh:change", () => (auth.languageCode = FH.etat.lang));
  A.onAuthStateChanged(auth, (user) => {
    if (user && modeCode) return; // inscription par téléphone en cours
    memoriser(user);
    afficherTableau(user);
  });
}

// Affiche le lien d'administration si le compte figure dans la collection « admins »
async function verifierAdmin(user) {
  var el = $("dash-admin");
  if (!el) return;
  if (!user || !db || !fstore || !configure) { el.hidden = true; return; }
  try {
    var s = await fstore.getDoc(fstore.doc(db, "admins", user.uid));
    el.hidden = !s.exists();
  } catch (e) { el.hidden = true; }
}

let verificateur = null;
function recaptcha() {
  if (!verificateur) verificateur = new fb.RecaptchaVerifier(auth, "recaptcha", { size: "invisible" });
  return verificateur;
}
async function envoyerSms(e164, mode) {
  confirmation = await fb.signInWithPhoneNumber(auth, e164, recaptcha());
  modeCode = mode;
  $("code").value = "";
  $("champ-newpw").hidden = mode !== "reset";
  $("code-info").textContent = t("acc.code.sent", { phone: e164 });
  message(null);
  montrer("form-code");
  $("code").focus();
}

async function persistance() {
  await fb.setPersistence(auth, $("remember").checked ? fb.browserLocalPersistence : fb.browserSessionPersistence);
}

// ---------- Connexion ----------
$("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!auth) return;
  const pw = $("login-pw").value;
  let identifiant;
  if (parTelephone("form-login")) {
    const n = numero("login-phone");
    if (!n) return message("err.phone");
    identifiant = emailTel(n);
  } else {
    identifiant = $("login-email").value.trim();
    if (!emailValide(identifiant)) return message("err.email");
  }
  if (!pw) return message("err.required");
  occupe("form-login", true);
  try {
    await persistance();
    const r = await fb.signInWithEmailAndPassword(auth, identifiant, pw);
    message(r.user.phoneNumber || r.user.emailVerified ? null : "err.notverified", null, "info");
  } catch (err) {
    message(codeErreur(err));
  } finally {
    occupe("form-login", false);
  }
});

// ---------- Inscription ----------
$("form-signup").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!auth) return;
  const prenom = $("su-prenom").value.trim();
  const nom = $("su-nom").value.trim();
  const pw = $("su-pw").value;
  if (!prenom || !nom || !pw) return message("err.required");
  if (pw.length < 8) return message("err.pwshort");
  if (pw !== $("su-pw2").value) return message("err.pwmatch");
  occupe("form-signup", true);
  try {
    await persistance();
    if (parTelephone("form-signup")) {
      const n = numero("su-phone");
      if (!n) return message("err.phone");
      attente = { prenom, nom, pw, e164: n };
      await envoyerSms(n, "signup");
    } else {
      const email = $("su-email").value.trim();
      if (!emailValide(email)) return message("err.email");
      const r = await fb.createUserWithEmailAndPassword(auth, email, pw);
      await fb.updateProfile(r.user, { displayName: prenom + " " + nom });
      await fb.sendEmailVerification(r.user);
      memoriser(r.user);
      afficherTableau(r.user);
      message("acc.email.sent", { email }, "ok");
    }
  } catch (err) {
    message(codeErreur(err));
  } finally {
    occupe("form-signup", false);
  }
});

// ---------- Code SMS ----------
$("form-code").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!confirmation) return;
  const code = $("code").value.replace(/\D/g, "");
  if (code.length !== 6) return message("err.code");
  occupe("form-code", true);
  try {
    const r = await confirmation.confirm(code);
    const aDejaMotDePasse = r.user.providerData.some((p) => p.providerId === "password");
    if (modeCode === "signup") {
      if (aDejaMotDePasse) {
        modeCode = null;
        await fb.signOut(auth);
        montrer("form-login");
        return message("err.exists");
      }
      await fb.linkWithCredential(r.user, fb.EmailAuthProvider.credential(emailTel(attente.e164), attente.pw));
      await fb.updateProfile(r.user, { displayName: attente.prenom + " " + attente.nom });
      attente = null;
      message(null);
    } else {
      const npw = $("newpw").value;
      if (npw.length < 8) { occupe("form-code", false); return message("err.pwshort"); }
      if (aDejaMotDePasse) await fb.updatePassword(r.user, npw);
      else await fb.linkWithCredential(r.user, fb.EmailAuthProvider.credential(emailTel(r.user.phoneNumber), npw));
      message("acc.pw.saved", null, "ok");
    }
    modeCode = null;
    await r.user.reload();
    memoriser(auth.currentUser);
    afficherTableau(auth.currentUser);
  } catch (err) {
    message(codeErreur(err));
  } finally {
    occupe("form-code", false);
  }
});

// ---------- Mot de passe oublié ----------
$("btn-forgot").addEventListener("click", () => { message(null); montrer("form-forgot"); });
$("form-forgot").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!auth) return;
  occupe("form-forgot", true);
  try {
    if (parTelephone("form-forgot")) {
      const n = numero("fg-phone");
      if (!n) return message("err.phone");
      await envoyerSms(n, "reset");
    } else {
      const email = $("fg-email").value.trim();
      if (!emailValide(email)) return message("err.email");
      await fb.sendPasswordResetEmail(auth, email);
      message("acc.reset.sent", { email }, "ok");
    }
  } catch (err) {
    message(codeErreur(err));
  } finally {
    occupe("form-forgot", false);
  }
});

// ---------- Tableau de bord ----------
$("btn-logout").addEventListener("click", async () => {
  if (auth) await fb.signOut(auth);
  memoriser(null);
  message(null);
  montrer("form-login");
});
$("btn-resend").addEventListener("click", async () => {
  try { await fb.sendEmailVerification(auth.currentUser); message("acc.email.sent", { email: auth.currentUser.email }, "ok"); }
  catch (err) { message(codeErreur(err)); }
});
$("btn-check").addEventListener("click", async () => {
  await auth.currentUser.reload();
  afficherTableau(auth.currentUser);
  message(auth.currentUser.emailVerified ? null : "err.notverified", null, "info");
});

demarrer().catch((e) => { console.error(e); message("err.generic"); });
