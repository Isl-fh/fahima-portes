/* Administration FAHIMA PORTES — connexion sécurisée + gestion du catalogue (Firestore) */
import { firebaseConfig } from "./firebase-config.js";
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
let arreterEcoute = null; // désabonnement de l'écoute Firestore

const TYPES = ["blindee", "fer-forge", "simple", "double", "chambre", "salon"];

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

async function demarrer() {
  if (!configure) { montrerVue("vue-hors-service"); return; }
  const v = "10.12.2";
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore.js`)
  ]);
  fb = A; fstore = F;
  const app = initializeApp(firebaseConfig);
  auth = A.getAuth(app);
  db = F.getFirestore(app);
  A.onAuthStateChanged(auth, gererUtilisateur);
}

async function gererUtilisateur(u) {
  utilisateur = u;
  arreterEcouteCatalogue();
  produits = [];
  fermerFormulaire();
  $("btn-importer").hidden = true;
  if (!u) { montrerVue("vue-connexion"); return; }
  let admin = false;
  try {
    const s = await fstore.getDoc(fstore.doc(db, "admins", u.uid));
    admin = s.exists();
  } catch (e) { admin = false; }
  if (u !== utilisateur) return; // l'utilisateur a changé pendant la vérification
  if (!admin) { montrerVue("vue-refuse"); return; }
  $("admin-email-affiche").textContent = u.email || u.phoneNumber || "";
  montrerVue("vue-admin");
  ecouterProduits();
}

function arreterEcouteCatalogue() {
  if (arreterEcoute) { try { arreterEcoute(); } catch (e) {} arreterEcoute = null; }
}

// ---------- Connexion ----------
$("form-admin-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!auth) return;
  const email = $("admin-email").value.trim();
  const pw = $("admin-pw").value;
  if (!email || !pw) return;
  try {
    await fb.setPersistence(auth, fb.browserLocalPersistence);
    await fb.signInWithEmailAndPassword(auth, email, pw);
    $("admin-pw").value = "";
  } catch (err) {
    const m = $("admin-message");
    m.textContent = "Connexion impossible : vérifiez votre e-mail et votre mot de passe.";
    m.hidden = false;
  }
});
$("btn-admin-logout").addEventListener("click", () => auth && fb.signOut(auth));
$("btn-refuse-logout").addEventListener("click", () => auth && fb.signOut(auth));

// ---------- Lecture du catalogue ----------
function ecouterProduits() {
  arreterEcouteCatalogue();
  arreterEcoute = fstore.onSnapshot(
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
      '<div class="infos-ligne"><p class="nom-ligne">' + esc((p.fr && p.fr.n) || p.id) + '</p>' +
      '<p class="details-ligne">' + esc(Number(p.eur).toFixed(2)) + ' € · ' + esc(typesTxt) +
      (p.visible ? "" : ' · <span class="cache">masquée</span>') + '</p></div>' +
      '<div class="actions-ligne">' +
      '<button type="button" class="secondaire btn-mini" data-act="modifier">Modifier</button>' +
      '<button type="button" class="secondaire btn-mini" data-act="visible">' + (p.visible ? "Masquer" : "Afficher") + '</button>' +
      '<button type="button" class="secondaire btn-mini danger" data-act="supprimer">Supprimer</button>' +
      '</div>';
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

// ---------- Formulaire ----------
$("btn-ajouter").addEventListener("click", () => ouvrirFormulaire(null));
$("btn-annuler").addEventListener("click", fermerFormulaire);

function ouvrirFormulaire(p) {
  editionId = p ? p.id : null;
  $("form-titre").textContent = p ? 'Modifier : ' + ((p.fr && p.fr.n) || p.id) : "Nouvelle offre";
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
  if (!editionId && produits.some((p) => p.id === id)) return message("Une offre porte déjà ce nom : choisissez un autre nom.");

  const donnees = { id, ordre, img, eur, types, visible: $("p-visible").checked, fr, ar, en };
  try {
    await fstore.setDoc(fstore.doc(db, "products", id), donnees);
    message('Offre "' + nomFr + '" enregistrée.', "ok");
    fermerFormulaire();
  } catch (err) {
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
      const existant = await fstore.getDoc(ref);
      if (existant.exists()) continue; // n'écrase jamais une offre déjà enregistrée
      const donnees = Object.assign({ ordre: i + 1, visible: true }, p);
      await fstore.setDoc(ref, donnees);
      ajoutes++;
    }
    message("Import terminé : " + ajoutes + " offre(s) ajoutée(s), les offres existantes ont été conservées.", "ok");
  } catch (err) {
    message("Import impossible : " + err.message);
  }
});

demarrer().catch((e) => {
  console.error(e);
  montrerVue("vue-hors-service");
});
