/* Administration FAHIMA PORTES — connexion sécurisée + gestion du catalogue,
   des demandes de devis, des commandes et des avis clients (Firestore). */
import { firebaseConfig } from "./firebase-config.js";
import { session, verifierAdmin } from "./session.js";
import { PRODUITS_INITIAUX } from "./produits-initiaux.js";

const $ = (id) => document.getElementById(id);
const configure = firebaseConfig.apiKey && firebaseConfig.apiKey !== "A_REMPLIR";

let fb = null;       // module firebase-auth
let fstore = null;   // module firebase-firestore
let auth = null;
let db = null;
let utilisateur = null;
let produits = [];
let editionId = null; // null = création d'une offre
let arreterEcouteProduits = null;
let arreterEcouteDevis = null;
let arreterEcouteCommandes = null;
let arreterEcouteAvis = null;

const TYPES = ["blindee", "fer-forge", "simple", "double", "extra-large", "chambre", "salon"];
const STATUTS_DEVIS = ["nouveau", "en-cours", "traite"];
const STATUTS_COMMANDE = ["en-cours", "expediee", "installee"];

function esc(s) { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
function montrerVue(id) {
  ["vue-hors-service", "vue-connexion", "vue-refuse", "vue-admin"].forEach((v) => { $(v).hidden = v !== id; });
}
function message(txt, type) {
  const el = $("admin-message-2");
  if (!txt) { el.hidden = true; return; }
  el.textContent = txt;
  el.className = "alerte" + (type ? " " + type : "");
  el.hidden = false;
}
function dateCourte(ts) {
  if (!ts || !ts.seconds) return "";
  return new Date(ts.seconds * 1000).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

async function demarrer() {
  if (!configure) { montrerVue("vue-hors-service"); return; }
  await session.quand;
  fb = session.fb;
  fstore = session.fstore;
  auth = session.auth;
  db = session.db;
  fb.onAuthStateChanged(auth, gererUtilisateur);
}

async function gererUtilisateur(u) {
  utilisateur = u;
  arreterTout();
  produits = [];
  fermerFormulaire();
  $("btn-importer").hidden = true;
  if (!u) { montrerVue("vue-connexion"); infoConnexion(null); return; }
  montrerVue("vue-connexion");
  infoConnexion("Connecté. Vérification des droits administrateur…", false);
  const r = await verifierAdmin(u);
  if (u !== utilisateur) return; // l'utilisateur a changé pendant la vérification
  if (r.erreur) {
    infoConnexion("Vérification impossible (" + ((r.erreur && r.erreur.code) || r.erreur.message || "") + "). " +
      "Si l'erreur persiste, publiez les dernières règles de sécurité dans Firebase (voir GUIDE-ADMIN.md).", true);
    return;
  }
  infoConnexion(null);
  if (!r.admin) { montrerVue("vue-refuse"); return; }
  $("admin-email-affiche").textContent = u.email || u.phoneNumber || "";
  montrerVue("vue-admin");
  ecouterProduits();
  ecouterDevis();
  ecouterCommandes();
  ecouterAvis();
}

function arreterTout() {
  [arreterEcouteProduits, arreterEcouteDevis, arreterEcouteCommandes, arreterEcouteAvis].forEach((f) => {
    if (f) { try { f(); } catch (e) {} }
  });
  arreterEcouteProduits = arreterEcouteDevis = arreterEcouteCommandes = arreterEcouteAvis = null;
}

function infoConnexion(txt, erreur) {
  const m = $("admin-message");
  if (!txt) { m.hidden = true; return; }
  m.textContent = txt;
  m.hidden = false;
  m.className = "alerte" + (erreur ? "" : " info");
}

// ---------- Connexion ----------
$("form-admin-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!auth) return;
  const email = $("admin-email").value.trim();
  const pw = $("admin-pw").value;
  if (!email || !pw) return;
  infoConnexion("Connexion en cours…", false);
  try {
    await fb.signInWithEmailAndPassword(auth, email, pw);
    $("admin-pw").value = "";
  } catch (err) {
    const code = err && err.code ? " (" + err.code + ")" : "";
    infoConnexion("Connexion impossible : vérifiez votre e-mail et votre mot de passe." + code, true);
  }
});
$("btn-admin-logout").addEventListener("click", () => auth && fb.signOut(auth));
$("btn-refuse-logout").addEventListener("click", () => auth && fb.signOut(auth));

// ---------- Lecture du catalogue ----------
function ecouterProduits() {
  arreterEcouteProduits && arreterEcouteProduits();
  arreterEcouteProduits = fstore.onSnapshot(
    fstore.query(fstore.collection(db, "products"), fstore.orderBy("ordre")),
    (snap) => {
      produits = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
      $("btn-importer").hidden = produits.length > 0;
      rendreListe();
    },
    (err) => message("Impossible de charger le catalogue : " + err.message)
  );
}

function rendreListe() {
  const zone = $("liste-produits");
  zone.innerHTML = "";
  if (!produits.length) {
    zone.innerHTML = '<p class="alerte info">Aucune offre pour l\'instant. Ajoutez une offre ou importez le catalogue actuel.</p>';
    return;
  }
  produits.forEach((p) => {
    const ligne = document.createElement("div");
    ligne.className = "ligne-produit";
    const typesTxt = (p.types || []).join(", ");
    ligne.innerHTML =
      '<img alt="" loading="lazy">' +
      '<div class="infos-ligne"><p class="nom-ligne">' + esc((p.fr && p.fr.n) || p.id) + "</p>" +
      '<p class="details-ligne">' + esc(Number(p.eur).toFixed(2)) + " € · " + esc(typesTxt) +
      (p.visible ? "" : ' · <span class="cache">masquée</span>') + "</p></div>" +
      '<div class="actions-ligne">' +
      '<button type="button" class="secondaire btn-mini" data-act="modifier">Modifier</button>' +
      '<button type="button" class="secondaire btn-mini" data-act="visible">' + (p.visible ? "Masquer" : "Afficher") + "</button>" +
      '<button type="button" class="secondaire btn-mini danger" data-act="supprimer">Supprimer</button>' +
      "</div>";
    const image = ligne.querySelector("img");
    image.src = p.img; // affectation directe : jamais insérée dans du HTML
    image.onerror = function () { image.style.visibility = "hidden"; };
    ligne.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => actionLigne(b.dataset.act, p)));
    zone.appendChild(ligne);
  });
}

async function actionLigne(acte, p) {
  if (acte === "modifier") return ouvrirFormulaire(p);
  if (acte === "visible") {
    try {
      await fstore.updateDoc(fstore.doc(db, "products", p.id), { visible: !p.visible });
      message(null);
    } catch (e) { message("Modification impossible : " + e.message); }
  }
  if (acte === "supprimer") {
    if (!confirm('Supprimer définitivement l\'offre "' + ((p.fr && p.fr.n) || p.id) + '" ?')) return;
    try {
      await fstore.deleteDoc(fstore.doc(db, "products", p.id));
      message(null);
    } catch (e) { message("Suppression impossible : " + e.message); }
  }
}

// ---------- Formulaire produit ----------
$("btn-ajouter").addEventListener("click", () => ouvrirFormulaire(null));
$("btn-annuler").addEventListener("click", fermerFormulaire);

function ouvrirFormulaire(p) {
  editionId = p ? p.id : null;
  $("form-titre").textContent = p ? "Modifier : " + ((p.fr && p.fr.n) || p.id) : "Nouvelle offre";
  const d = p || {};
  const x = (l) => (d[l] || d.fr || {});
  $("p-nom-fr").value = (d.fr && d.fr.n) || "";
  $("p-nom-ar").value = (d.ar && d.ar.n && d.ar.n !== d.fr.n) ? d.ar.n : "";
  $("p-nom-en").value = (d.en && d.en.n && d.en.n !== d.fr.n) ? d.en.n : "";
  $("p-desc-fr").value = (d.fr && d.fr.d) || "";
  $("p-desc-ar").value = (d.ar && d.ar.d && d.ar.d !== d.fr.d) ? d.ar.d : "";
  $("p-desc-en").value = (d.en && d.en.d && d.en.d !== d.fr.d) ? d.en.d : "";
  $("p-caract-fr").value = (d.fr && d.fr.f || []).join("\n");
  $("p-caract-ar").value = (d.ar && d.ar.f && d.ar.f.join("\n") !== (d.fr && d.fr.f || []).join("\n")) ? d.ar.f.join("\n") : "";
  $("p-caract-en").value = (d.en && d.en.f && d.en.f.join("\n") !== (d.fr && d.fr.f || []).join("\n")) ? d.en.f.join("\n") : "";
  $("p-prix").value = d.eur != null ? d.eur : "";
  $("p-image").value = d.img || "";
  $("p-ordre").value = p ? d.ordre : produits.length + 1;
  $("p-visible").checked = p ? !!d.visible : true;
  document.querySelectorAll('#form-produit input[name="type"]').forEach((c) => {
    c.checked = !!d.types && d.types.indexOf(c.value) > -1;
  });
  $("form-produit").hidden = false;
  message(null);
  $("form-produit").scrollIntoView({ behavior: "smooth", block: "start" });
}
function fermerFormulaire() {
  editionId = null;
  $("form-produit").hidden = true;
}

function slug(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
function lignes(id) {
  return $(id).value.split("\n").map((s) => s.trim()).filter(Boolean);
}
function blocLangue(nomId, descId, caractId, fr) {
  const n = $(nomId).value.trim(), d = $(descId).value.trim(), f = lignes(caractId);
  if (!n && !d && !f.length) return fr; // vide = reprise du français
  return { n: n || fr.n, d: d || fr.d, f: f.length ? f : fr.f };
}

$("form-produit").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!db) return;
  const nomFr = $("p-nom-fr").value.trim();
  const descFr = $("p-desc-fr").value.trim();
  const eur = Number($("p-prix").value);
  const img = $("p-image").value.trim();
  const ordre = Number($("p-ordre").value);
  const types = Array.from(document.querySelectorAll('#form-produit input[name="type"]:checked')).map((c) => c.value);
  if (!nomFr) return message("Le nom en français est obligatoire.");
  if (!descFr) return message("La description en français est obligatoire.");
  if (!(eur > 0)) return message("Indiquez un prix valide en euros.");
  if (!types.length) return message("Choisissez au moins une catégorie.");
  if (!img) return message("Indiquez une image (nom de fichier ou adresse https).");
  // Image : nom de fichier du site (produit-XX.webp…) ou adresse https complète
  if (!/^(https:\/\/[^\s"']+|[a-z0-9][a-z0-9-_.]*\.(webp|png|jpe?g))$/i.test(img))
    return message("Image non valide : indiquez un nom de fichier du site (ex. produit-10.webp) ou une adresse https complète.");
  if (!(ordre >= 1)) return message("Indiquez une position valide (1 ou plus).");

  const fr = { n: nomFr, d: descFr, f: lignes("p-caract-fr") };
  const ar = blocLangue("p-nom-ar", "p-desc-ar", "p-caract-ar", fr);
  const en = blocLangue("p-nom-en", "p-desc-en", "p-caract-en", fr);
  const id = editionId || slug(nomFr);
  const donnees = { id, ordre, img, eur, types, visible: $("p-visible").checked, fr, ar, en };
  try {
    if (editionId) {
      // Modification : remplacement complet autorisé
      await fstore.setDoc(fstore.doc(db, "products", editionId), donnees);
    } else {
      // Création : transaction — n'écrase jamais une offre créée simultanément
      await fstore.runTransaction(db, (tx) =>
        tx.get(fstore.doc(db, "products", id)).then((snap) => {
          if (snap.exists()) throw new Error("offre-existe");
          tx.set(fstore.doc(db, "products", id), donnees);
        })
      );
    }
    message('Offre "' + nomFr + '" enregistrée.', "ok");
    fermerFormulaire();
  } catch (err) {
    if (err && err.message === "offre-existe")
      return message("Une offre porte déjà ce nom : choisissez un autre nom.");
    message("Enregistrement impossible : " + err.message);
  }
});

// ---------- Import initial du catalogue actuel ----------
$("btn-importer").addEventListener("click", async () => {
  if (!db) return;
  if (!confirm("Importer les 8 modèles actuels dans la base ? Vous pourrez ensuite les modifier.")) return;
  try {
    let ajoutes = 0;
    for (let i = 0; i < PRODUITS_INITIAUX.length; i++) {
      const p = PRODUITS_INITIAUX[i];
      const ref = fstore.doc(db, "products", p.id);
      const donnees = Object.assign({ ordre: i + 1, visible: true }, p);
      // Transaction : ne crée que si l'offre est toujours absente,
      // même si un autre administrateur agit au même moment.
      const cree = await fstore.runTransaction(db, (tx) =>
        tx.get(ref).then((snap) => {
          if (snap.exists()) return false;
          tx.set(ref, donnees);
          return true;
        })
      );
      if (cree) ajoutes++;
    }
    message("Import terminé : " + ajoutes + " offre(s) ajoutée(s), les offres existantes ont été conservées.", "ok");
  } catch (err) {
    message("Import impossible : " + err.message);
  }
});

// ---------- Demandes de devis ----------
function ecouterDevis() {
  arreterEcouteDevis && arreterEcouteDevis();
  arreterEcouteDevis = fstore.onSnapshot(
    fstore.query(fstore.collection(db, "devis"), fstore.orderBy("date", "desc")),
    (snap) => rendreDevis(snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))),
    (err) => console.warn("Devis indisponibles.", err)
  );
}

function rendreDevis(liste) {
  const zone = $("liste-devis");
  zone.innerHTML = "";
  if (!liste.length) {
    zone.innerHTML = '<p class="alerte info">Aucune demande de devis pour le moment.</p>';
    return;
  }
  liste.forEach((v) => {
    const ligne = document.createElement("div");
    ligne.className = "ligne-produit ligne-large";
    ligne.innerHTML =
      '<div class="infos-ligne"><p class="nom-ligne">' + esc(v.nom || "") + " · " + esc(v.produit || "") + "</p>" +
      '<p class="details-ligne">' + esc(dateCourte(v.date)) + " · " + esc(v.telephone || "") + " · " + esc(v.email || "") + "</p>" +
      (v.message ? '<p class="msg-ligne">' + esc(v.message) + "</p>" : "") + "</div>" +
      '<div class="actions-ligne">' +
      '<select class="select-statut" aria-label="Statut">' +
      STATUTS_DEVIS.map((s) => '<option value="' + s + '"' + (v.statut === s ? " selected" : "") + ">" + s + "</option>").join("") +
      "</select>" +
      '<button type="button" class="secondaire btn-mini danger" data-act="supprimer-devis">Supprimer</button>' +
      "</div>";
    ligne.querySelector("select").addEventListener("change", async (e) => {
      try {
        await fstore.updateDoc(fstore.doc(db, "devis", v.id), { statut: e.target.value });
        message("Statut mis à jour.", "ok");
      } catch (err) { message("Modification impossible : " + err.message); }
    });
    ligne.querySelector("[data-act='supprimer-devis']").addEventListener("click", async () => {
      if (!confirm("Supprimer cette demande de devis ?")) return;
      try { await fstore.deleteDoc(fstore.doc(db, "devis", v.id)); message(null); }
      catch (err) { message("Suppression impossible : " + err.message); }
    });
    zone.appendChild(ligne);
  });
}

// ---------- Commandes ----------
function ecouterCommandes() {
  arreterEcouteCommandes && arreterEcouteCommandes();
  arreterEcouteCommandes = fstore.onSnapshot(
    fstore.query(fstore.collection(db, "commandes"), fstore.orderBy("date", "desc")),
    (snap) => rendreCommandes(snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))),
    (err) => console.warn("Commandes indisponibles.", err)
  );
}

function rendreCommandes(liste) {
  const zone = $("liste-commandes");
  zone.innerHTML = "";
  if (!liste.length) {
    zone.innerHTML = '<p class="alerte info">Aucune commande pour le moment. Créez une commande pour un client avec « + Nouvelle commande ».</p>';
    return;
  }
  liste.forEach((v) => {
    const ligne = document.createElement("div");
    ligne.className = "ligne-produit ligne-large";
    ligne.innerHTML =
      '<div class="infos-ligne"><p class="nom-ligne">' + esc(v.produit || "") + " · " + esc(v.clientEmail || "") + "</p>" +
      '<p class="details-ligne">' + esc(dateCourte(v.date)) + (v.prix ? " · " + esc(Number(v.prix).toFixed(2)) + " €" : "") + "</p>" +
      (v.notes ? '<p class="msg-ligne">' + esc(v.notes) + "</p>" : "") + "</div>" +
      '<div class="actions-ligne">' +
      '<select class="select-statut" aria-label="Statut">' +
      STATUTS_COMMANDE.map((s) => '<option value="' + s + '"' + (v.statut === s ? " selected" : "") + ">" + s + "</option>").join("") +
      "</select>" +
      '<button type="button" class="secondaire btn-mini danger" data-act="supprimer-commande">Supprimer</button>' +
      "</div>";
    ligne.querySelector("select").addEventListener("change", async (e) => {
      try {
        await fstore.updateDoc(fstore.doc(db, "commandes", v.id), { statut: e.target.value });
        message("Statut mis à jour.", "ok");
      } catch (err) { message("Modification impossible : " + err.message); }
    });
    ligne.querySelector("[data-act='supprimer-commande']").addEventListener("click", async () => {
      if (!confirm("Supprimer cette commande ?")) return;
      try { await fstore.deleteDoc(fstore.doc(db, "commandes", v.id)); message(null); }
      catch (err) { message("Suppression impossible : " + err.message); }
    });
    zone.appendChild(ligne);
  });
}

$("btn-commande").addEventListener("click", () => {
  $("form-commande").hidden = false;
  $("form-commande").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("btn-commande-annuler").addEventListener("click", () => { $("form-commande").hidden = true; });

$("form-commande").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!db) return;
  const email = $("c-email").value.trim().toLowerCase();
  const produit = $("c-produit").value.trim();
  const prix = Number($("c-prix").value);
  const notes = $("c-notes").value.trim();
  const statut = $("c-statut").value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return message("Indiquez l'adresse e-mail du client (celle de son compte).");
  if (!produit) return message("Indiquez le produit commandé.");
  try {
    await fstore.addDoc(fstore.collection(db, "commandes"), {
      clientEmail: email,
      produit: produit.slice(0, 80),
      prix: prix > 0 ? prix : 0,
      notes: notes.slice(0, 500),
      statut,
      date: fstore.serverTimestamp()
    });
    message("Commande créée. Elle apparaît dans l'espace client associé à cette adresse e-mail.", "ok");
    $("form-commande").reset();
    $("form-commande").hidden = true;
  } catch (err) {
    message("Création impossible : " + err.message);
  }
});

// ---------- Avis clients ----------
function ecouterAvis() {
  arreterEcouteAvis && arreterEcouteAvis();
  arreterEcouteAvis = fstore.onSnapshot(
    fstore.query(fstore.collection(db, "avis"), fstore.orderBy("date", "desc")),
    (snap) => rendreAvis(snap.docs.map((d) => Object.assign({ id: d.id }, d.data()))),
    (err) => console.warn("Avis indisponibles.", err)
  );
}

function rendreAvis(liste) {
  const zone = $("liste-avis");
  zone.innerHTML = "";
  if (!liste.length) {
    zone.innerHTML = '<p class="alerte info">Aucun avis client pour le moment.</p>';
    return;
  }
  liste.forEach((v) => {
    const pleines = "★★★★★".slice(0, v.note || 0) + "☆☆☆☆☆".slice(0, 5 - (v.note || 0));
    const ligne = document.createElement("div");
    ligne.className = "ligne-produit ligne-large";
    ligne.innerHTML =
      '<div class="infos-ligne"><p class="nom-ligne">' + esc(v.produit || "") + ' <span class="etoiles-admin">' + pleines + "</span></p>" +
      '<p class="details-ligne">' + esc(v.nom || "") + " · " + esc(dateCourte(v.date)) + (v.visible ? "" : " · masqué") + "</p>" +
      '<p class="msg-ligne">' + esc(v.texte || "") + "</p></div>" +
      '<div class="actions-ligne">' +
      '<button type="button" class="secondaire btn-mini" data-act="basculer-avis">' + (v.visible ? "Masquer" : "Afficher") + "</button>" +
      '<button type="button" class="secondaire btn-mini danger" data-act="supprimer-avis">Supprimer</button>' +
      "</div>";
    ligne.querySelector("[data-act='basculer-avis']").addEventListener("click", async () => {
      try { await fstore.updateDoc(fstore.doc(db, "avis", v.id), { visible: !v.visible }); message(null); }
      catch (err) { message("Modification impossible : " + err.message); }
    });
    ligne.querySelector("[data-act='supprimer-avis']").addEventListener("click", async () => {
      if (!confirm("Supprimer cet avis ?")) return;
      try { await fstore.deleteDoc(fstore.doc(db, "avis", v.id)); message(null); }
      catch (err) { message("Suppression impossible : " + err.message); }
    });
    zone.appendChild(ligne);
  });
}

demarrer().catch((e) => {
  console.error(e);
  montrerVue("vue-hors-service");
});
