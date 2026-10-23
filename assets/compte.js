/* Espace client FAHIMA PORTES — connexion, inscription et tableau de bord :
   profil, demandes de devis, commandes, favoris et avis. */
import { firebaseConfig, DOMAINE_TEL, TEL_ACTIF } from "./firebase-config.js?v=20261102";
import { session, verifierAdmin } from "./session.js?v=20261102";

// Inscription / connexion par téléphone (SMS) : désactivée dans cette version.
if (!TEL_ACTIF) {
  document.querySelectorAll('input[value="phone"]').forEach((r) => { r.disabled = true; });
  document.querySelectorAll(".par-phone").forEach((e) => { e.hidden = true; });
  document.querySelectorAll(".methode").forEach((g) => { g.hidden = true; });
}

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

// ---------- Firebase (via session.js, partagé avec les autres pages) ----------
let fb = null;
let fstore = null;
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
  if (!window.FH) return;
  if (!user) { FH.ecrire("fh-user", "null"); return; }
  const [prenom, ...reste] = (user.displayName || "").split(" ");
  const vraiEmail = user.email && !user.email.endsWith("@" + DOMAINE_TEL) ? user.email : "";
  FH.ecrire("fh-user", JSON.stringify({ prenom, nom: reste.join(" "), email: vraiEmail, telephone: user.phoneNumber || "" }));
}

function afficherTableau(user) {
  window.__fhUser = user;
  $("vue-auth").hidden = !!user;
  $("vue-dash").hidden = !user;
  /* Colonne de gauche : texte adapté à l'état connecté ou non */
  const intro = document.querySelector('.panneau-gauche p[data-i18n^="acc.intro"]');
  if (intro) {
    intro.setAttribute("data-i18n", user ? "acc.intro.co" : "acc.intro");
    intro.textContent = t(user ? "acc.intro.co" : "acc.intro");
  }
  verifierAdmin(user).then((r) => { const el = $("dash-admin"); if (el) el.hidden = !r.admin; });
  if (!user) return;
  const prenom = (user.displayName || "").split(" ")[0] || "";
  $("dash-titre").textContent = t("acc.welcome", { name: prenom }).trim();
  const parTel = !!user.phoneNumber;
  $("dash-contact").textContent = parTel ? user.phoneNumber : user.email;
  const verifie = parTel || user.emailVerified;
  $("dash-statut").textContent = t(verifie ? "acc.verified" : "acc.unverified");
  $("dash-statut").className = verifie ? "verifie" : "attente";
  $("dash-verif").hidden = verifie;
  chargerTableauDeBord(user);
}

async function demarrer() {
  if (!configure) return;
  await session.quand;
  fb = session.fb;
  fstore = session.fstore;
  auth = session.auth;
  db = session.db;
  // La page réagit aux changements de connexion diffusés par session.js.
  document.addEventListener("fh:user", function (e) {
    if (e.detail.user && modeCode) return; // inscription par téléphone en cours
    afficherTableau(e.detail.user);
  });
  if (session.user) afficherTableau(session.user);
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
  /* Stockage indisponible (cadre restreint, navigation privée) :
     la persistance en mémoire est déjà définie par session.js. */
  if (session.stockageLocal === false) return;
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
    afficherTableau(r.user); // reste sur la page : le tableau de bord s'affiche directement
    return;
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

// Onglets du tableau de bord
document.querySelectorAll("[data-dash]").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("[data-dash]").forEach((x) => x.classList.toggle("actif", x === b));
    ["profil", "devis", "commandes", "favoris", "avis"].forEach((k) => {
      $("dash-" + k).hidden = k !== b.dataset.dash;
    });
  })
);

function esc(s) { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
function dateCourte(ts) {
  if (!ts || !ts.seconds) return "";
  return new Date(ts.seconds * 1000).toLocaleDateString(FH.etat.lang === "ar" ? "ar" : FH.etat.lang);
}
function badgeStatut(statut) {
  const txt = FH.t("statut." + statut);
  const classes = { nouveau: "b-nouveau", "en-cours": "b-cours", traite: "b-ok" };
  return '<span class="badge-statut ' + (classes[statut] || "") + '">' + esc(txt) + "</span>";
}
function badgeCommande(statut) {
  const txt = FH.t("statut." + statut);
  const classes = {
    "en-attente": "b-nouveau",
    validee: "b-info",
    traitee: "b-info",
    "en-cours": "b-cours",
    "attente-livraison": "b-cours",
    livree: "b-ok"
  };
  return '<span class="badge-statut ' + (classes[statut] || "") + '">' + esc(txt) + "</span>";
}

async function chargerTableauDeBord(user) {
  chargerProfil(user);
  chargerDevis(user);
  chargerCommandes(user);
  chargerFavoris(user);
  chargerMesAvis(user);
}

// -- Profil --
async function chargerProfil(user) {
  const complet = (user.displayName || "").split(" ");
  $("pr-prenom").value = complet[0] || "";
  $("pr-nom").value = complet.slice(1).join(" ");
  $("pr-tel").value = "";
  if (!fstore || !db) return;
  try {
    const s = await fstore.getDoc(fstore.doc(db, "users", user.uid));
    if (s.exists()) {
      const d = s.data() || {};
      if (d.prenom) $("pr-prenom").value = d.prenom;
      if (d.nom != null) $("pr-nom").value = d.nom || "";
      if (d.telephone) $("pr-tel").value = d.telephone;
    }
  } catch (e) { /* profil absent : les champs Firebase servent de secours */ }
}

$("form-profil").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = session.user;
  if (!user || !fstore || !db) return;
  const prenom = $("pr-prenom").value.trim().slice(0, 60);
  const nom = $("pr-nom").value.trim().slice(0, 60);
  const tel = $("pr-tel").value.trim().slice(0, 30);
  try {
    const vraiEmail = user.email && !user.email.endsWith("@" + DOMAINE_TEL) ? user.email : "";
    await fstore.setDoc(fstore.doc(db, "users", user.uid), {
      prenom, nom, email: vraiEmail, telephone: tel
    });
    await fb.updateProfile(user, { displayName: (prenom + " " + nom).trim() });
    await user.reload();
    afficherTableau(session.auth.currentUser);
    message("acc.profil.ok", null, "ok");
  } catch (err) {
    message(codeErreur(err));
  }
});

// -- Changement de mot de passe (avec reconnexion) --
$("form-pw").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = session.user;
  if (!user || !fb) return;
  const actuel = $("pw-actuel").value;
  const nouveau = $("pw-nouveau").value;
  if (nouveau.length < 8) return message("err.pwshort");
  occupe("form-pw", true);
  try {
    const identifiant = user.email && !user.email.endsWith("@" + DOMAINE_TEL)
      ? user.email : emailTel(user.phoneNumber || "");
    const cred = fb.EmailAuthProvider.credential(identifiant, actuel);
    await fb.reauthenticateWithCredential(user, cred);
    await fb.updatePassword(user, nouveau);
    $("pw-actuel").value = "";
    $("pw-nouveau").value = "";
    message("acc.pw.ok", null, "ok");
  } catch (err) {
    message(codeErreur(err));
  } finally {
    occupe("form-pw", false);
  }
});

// -- Mes demandes de devis --
async function chargerDevis(user) {
  const zone = $("liste-devis");
  zone.innerHTML = "";
  if (!fstore || !db) return;
  try {
    const snap = await fstore.getDocs(
      fstore.query(fstore.collection(db, "devis"), fstore.where("uid", "==", user.uid))
    );
    const liste = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))
      .sort((a, b) => (b.date && b.date.seconds || 0) - (a.date && a.date.seconds || 0));
    if (!liste.length) { zone.innerHTML = '<p class="vide-dash">' + esc(FH.t("acc.dash.devis.vide")) + "</p>"; return; }
    liste.forEach((v) => {
      const art = document.createElement("article");
      art.className = "ligne-dash";
      art.innerHTML =
        '<div class="infos-ligne"><p class="nom-ligne">' + esc(v.produit || "") + "</p>" +
        '<p class="details-ligne">' + esc(dateCourte(v.date)) + " · " + badgeStatut(v.statut || "nouveau") + "</p>" +
        (v.message ? '<p class="msg-ligne">' + esc(v.message) + "</p>" : "") + "</div>" +
        '<div class="actions-ligne"><button type="button" class="secondaire btn-mini" data-annuler="' + esc(v.id) + '">' + esc(FH.t("acc.devis.annuler")) + "</button></div>";
      art.querySelector("[data-annuler]").addEventListener("click", async function () {
        if (!confirm("Annuler cette demande de devis ?")) return;
        try { await fstore.deleteDoc(fstore.doc(db, "devis", v.id)); chargerDevis(user); }
        catch (err) { message(codeErreur(err)); }
      });
      zone.appendChild(art);
    });
  } catch (e) { zone.innerHTML = ""; }
}

// -- Mes commandes --
async function chargerCommandes(user) {
  const zone = $("liste-commandes");
  zone.innerHTML = "";
  const email = (user.email || "").toLowerCase();
  if (!fstore || !db || !email || email.endsWith("@" + DOMAINE_TEL)) {
    zone.innerHTML = '<p class="vide-dash">' + esc(FH.t("acc.dash.commandes.vide")) + "</p>";
    return;
  }
  try {
    const snap = await fstore.getDocs(
      fstore.query(fstore.collection(db, "commandes"), fstore.where("clientEmail", "==", email))
    );
    const liste = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))
      .sort((a, b) => (b.date && b.date.seconds || 0) - (a.date && a.date.seconds || 0));
    if (!liste.length) { zone.innerHTML = '<p class="vide-dash">' + esc(FH.t("acc.dash.commandes.vide")) + "</p>"; return; }
    liste.forEach((v) => {
      const art = document.createElement("article");
      art.className = "ligne-dash";
      const livraison = v.typeLivraison === "livraison"
        ? FH.t("cmd.livraison.domicile")
        : (v.typeLivraison === "retrait" ? FH.t("cmd.retrait") : "");
      art.innerHTML =
        '<div class="infos-ligne"><p class="nom-ligne">' + esc(v.produit || "") + "</p>" +
        '<p class="details-ligne">' + esc(dateCourte(v.date)) + " · " + badgeCommande(v.statut || "en-attente") +
        (livraison ? " · " + esc(livraison) : "") + "</p>" +
        (v.typeLivraison === "livraison" && v.adresse ? '<p class="msg-ligne">' + esc(v.adresse) + "</p>" : "") +
        (v.message ? '<p class="msg-ligne">' + esc(v.message) + "</p>" : "") +
        (v.notes ? '<p class="msg-ligne">' + esc(v.notes) + "</p>" : "") + "</div>";
      zone.appendChild(art);
    });
  } catch (e) { zone.innerHTML = ""; }
}

// -- Mes favoris --
async function chargerFavoris(user) {
  const zone = $("liste-favoris");
  zone.innerHTML = "";
  if (!fstore || !db) return;
  try {
    const snap = await fstore.getDocs(fstore.collection(db, "users", user.uid, "favoris"));
    if (!snap.size) { zone.innerHTML = '<p class="vide-dash">' + esc(FH.t("acc.dash.favoris.vide")) + "</p>"; return; }
    for (const d of snap.docs) {
      const p = await fstore.getDoc(fstore.doc(db, "products", d.id)).catch(() => null);
      const donnees = p && p.exists() ? p.data() : null;
      const art = document.createElement("article");
      art.className = "ligne-dash favori-ligne";
      if (donnees && donnees.img) {
        const img = document.createElement("img");
        img.src = donnees.img;
        img.alt = "";
        img.loading = "lazy";
        art.appendChild(img);
      }
      const infos = document.createElement("div");
      infos.className = "infos-ligne";
      const x = donnees ? (donnees[FH.etat.lang] || donnees.fr || {}) : {};
      infos.innerHTML =
        '<p class="nom-ligne">' + esc((x && x.n) || d.id) + "</p>" +
        '<p class="details-ligne">' + (donnees ? esc(FH.prix(donnees.eur)) : "") + "</p>";
      const actions = document.createElement("div");
      actions.className = "actions-ligne";
      const lien = document.createElement("a");
      lien.className = "secondaire btn-mini";
      lien.href = "catalogue.html";
      lien.textContent = FH.t("acc.fav.voir");
      actions.appendChild(lien);
      art.appendChild(infos);
      art.appendChild(actions);
      zone.appendChild(art);
    }
  } catch (e) { zone.innerHTML = ""; }
}

// -- Mes avis --
async function chargerMesAvis(user) {
  const zone = $("liste-mes-avis");
  zone.innerHTML = "";
  if (!fstore || !db) return;
  try {
    const snap = await fstore.getDocs(
      fstore.query(fstore.collection(db, "avis"), fstore.where("uid", "==", user.uid))
    );
    const liste = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))
      .sort((a, b) => (b.date && b.date.seconds || 0) - (a.date && a.date.seconds || 0));
    if (!liste.length) { zone.innerHTML = '<p class="vide-dash">' + esc(FH.t("acc.dash.avis.vide")) + "</p>"; return; }
    for (const v of liste) {
      let nomProduit = v.produit || "";
      try {
        const p = await fstore.getDoc(fstore.doc(db, "products", v.produit));
        if (p.exists()) nomProduit = (p.data()[FH.etat.lang] || p.data().fr || {}).n || nomProduit;
      } catch (e) {}
      const art = document.createElement("article");
      art.className = "ligne-dash";
      const pleines = "★★★★★".slice(0, v.note || 0) + "☆☆☆☆☆".slice(0, 5 - (v.note || 0));
      art.innerHTML =
        '<div class="infos-ligne"><p class="nom-ligne">' + esc(nomProduit) + ' <span class="notes">' + pleines + "</span></p>" +
        '<p class="msg-ligne">' + esc(v.texte || "") + "</p>" +
        '<p class="details-ligne">' + esc(dateCourte(v.date)) + "</p></div>" +
        '<div class="actions-ligne"><button type="button" class="secondaire btn-mini" data-suppr="' + esc(v.id) + '">' + esc(FH.t("avis.supprimer")) + "</button></div>";
      art.querySelector("[data-suppr]").addEventListener("click", async function () {
        if (!confirm("Supprimer cet avis ?")) return;
        try { await fstore.deleteDoc(fstore.doc(db, "avis", v.id)); chargerMesAvis(user); }
        catch (err) { message(codeErreur(err)); }
      });
      zone.appendChild(art);
    }
  } catch (e) { zone.innerHTML = ""; }
}

demarrer().catch((e) => { console.error(e); message("err.generic"); });
