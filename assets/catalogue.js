/* Catalogue FAHIMA PORTES — produits, filtres, demande de devis,
   favoris et avis clients (notes + commentaires) via Firestore. */
import { PRODUITS_INITIAUX } from "./produits-initiaux.js?v=20261024";
import { firebaseConfig } from "./firebase-config.js?v=20261024";
import { session } from "./session.js?v=20261024";

(function () {
  // Prix de référence en euros (convertis automatiquement en dinars)
  var PRODUITS = PRODUITS_INITIAUX.map(function (p, i) {
    return Object.assign({ ordre: i + 1, visible: true }, p);
  });

  var grille = document.getElementById("catalogue");
  var aucun = document.getElementById("aucun-resultat");
  var recherche = document.getElementById("recherche");
  var categorie = document.getElementById("categorie");
  var prixMin = document.getElementById("prix-min");
  var prixMax = document.getElementById("prix-max");

  // Notes par produit : { id: { somme, nombre } }
  var statsAvis = {};
  // Favoris de l'utilisateur connecté : ensemble d'identifiants
  var favoris = {};

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  function etoiles(note) {
    note = Math.round(note);
    var pleines = "", vides = "";
    for (var i = 0; i < 5; i++) { pleines += "★"; if (i >= note) vides += "☆"; }
    return "★★★★★".slice(0, note) + "☆☆☆☆☆".slice(0, 5 - note);
  }

  function rendre() {
    var L = FH.etat.lang;
    grille.querySelectorAll(".porte").forEach(function (c) { c.remove(); });
    PRODUITS.forEach(function (p) {
      var x = p[L] || p.fr;
      var types = p.types.map(function (t) { return FH.t("type." + t); }).join(" · ");
      var a = document.createElement("article");
      a.className = "porte";
      a.dataset.id = p.id;
      a.innerHTML =
        '<img alt="" width="1024" height="1024" loading="lazy">' +
        '<button class="fav-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20.5c-5.2-3.5-8.5-6.4-8.5-10A4.7 4.7 0 0 1 8.2 6c1.6 0 3 .8 3.8 2.1C12.8 6.8 14.2 6 15.8 6a4.7 4.7 0 0 1 4.7 4.5c0 3.6-3.3 6.5-8.5 10Z"/></svg></button>' +
        '<div class="informations">' +
        "<h2>" + esc(x.n) + "</h2>" +
        '<p class="type">' + esc(types) + "</p>" +
        '<button class="avis-entree" type="button"></button>' +
        '<p class="description">' + esc(x.d) + "</p>" +
        '<p class="prix"><small>' + esc(FH.t("cat.from")) + "</small>" + esc(FH.prix(p.eur)) + "</p>" +
        '<ul class="details">' + x.f.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
        '<button class="devis" type="button">' + esc(FH.t("cat.quote")) + "</button>" +
        "</div>";
      var image = a.querySelector("img");
      image.src = p.img; // affectation directe : jamais insérée dans du HTML
      image.alt = x.n;
      a.querySelector(".devis").addEventListener("click", function () { ouvrir(p); });
      a.querySelector(".fav-btn").addEventListener("click", function () { basculerFavori(p.id); });
      a.querySelector(".avis-entree").addEventListener("click", function () { ouvrirAvis(p); });
      majFavBouton(a, p.id);
      majAvisEntree(a, p.id);
      grille.insertBefore(a, aucun);
    });
    document.querySelectorAll(".sym").forEach(function (s) { s.textContent = FH.symbole(); });
    if (PRODUITS.length) {
      var lo = Math.min.apply(null, PRODUITS.map(function (p) { return p.eur; }));
      var hi = Math.max.apply(null, PRODUITS.map(function (p) { return p.eur; }));
      prixMin.placeholder = FH.nombre(FH.convertir(lo));
      prixMax.placeholder = FH.nombre(FH.convertir(hi));
    } else {
      prixMin.placeholder = "";
      prixMax.placeholder = "";
    }
    prixMin.step = prixMax.step = FH.etat.cur === "EUR" ? "1" : "1000";
    filtrer();
  }

  // ---------- Favoris ----------
  function majFavBouton(carte, id) {
    var b = carte.querySelector(".fav-btn");
    if (!b) return;
    var actif = !!favoris[id];
    b.classList.toggle("actif", actif);
    b.setAttribute("aria-label", FH.t(actif ? "fav.retirer" : "fav.ajouter"));
  }

  async function chargerFavoris() {
    if (!session.user || !session.fstore || !session.db) { favoris = {}; return; }
    try {
      var snap = await session.fstore.getDocs(
        session.fstore.collection(session.db, "users", session.user.uid, "favoris")
      );
      favoris = {};
      snap.forEach(function (d) { favoris[d.id] = true; });
      grille.querySelectorAll(".porte").forEach(function (c) { majFavBouton(c, c.dataset.id); });
    } catch (e) { /* favoris indisponibles (règles non publiées) */ }
  }

  async function basculerFavori(id) {
    if (!session.user) { window.location.href = "compte.html"; return; }
    if (!session.fstore || !session.db) return;
    try {
      var ref = session.fstore.doc(session.db, "users", session.user.uid, "favoris", id);
      if (favoris[id]) { await session.fstore.deleteDoc(ref); delete favoris[id]; }
      else { await session.fstore.setDoc(ref, { date: session.fstore.serverTimestamp() }); favoris[id] = true; }
      grille.querySelectorAll(".porte").forEach(function (c) { if (c.dataset.id === id) majFavBouton(c, id); });
    } catch (e) {
      console.warn("Favori non enregistré.", e);
    }
  }

  // ---------- Avis ----------
  function majAvisEntree(carte, id) {
    var b = carte.querySelector(".avis-entree");
    if (!b) return;
    var s = statsAvis[id];
    if (s && s.nombre) {
      b.innerHTML = '<span class="notes">' + etoiles(s.somme / s.nombre) + "</span> " +
        FH.nombre(s.somme / s.nombre, 1) + " · " + s.nombre + " " + esc(FH.t("avis.titre").toLowerCase());
    } else {
      b.textContent = FH.t("avis.donner");
    }
  }

  async function chargerStatsAvis() {
    if (!session.fstore || !session.db) return;
    try {
      // Requête publique : seuls les avis visibles sont lisibles par tous.
      var snap = await session.fstore.getDocs(
        session.fstore.query(session.fstore.collection(session.db, "avis"), session.fstore.where("visible", "==", true))
      );
      statsAvis = {};
      snap.forEach(function (d) {
        var v = d.data();
        if (!v || typeof v.note !== "number" || !v.produit) return;
        if (!statsAvis[v.produit]) statsAvis[v.produit] = { somme: 0, nombre: 0 };
        statsAvis[v.produit].somme += v.note;
        statsAvis[v.produit].nombre++;
      });
      grille.querySelectorAll(".porte").forEach(function (c) { majAvisEntree(c, c.dataset.id); });
    } catch (e) { /* avis indisponibles (règles non publiées) */ }
  }

  var fenetreAvis = document.getElementById("fenetre-avis");
  var produitAvis = null;

  async function ouvrirAvis(p) {
    produitAvis = p;
    document.getElementById("avis-produit").textContent = (p[FH.etat.lang] || p.fr).n;
    fenetreAvis.classList.add("active");
    document.getElementById("fermer-avis").focus();
    await afficherListeAvis(p.id);
    majFormulaireAvis();
  }
  function fermerAvis() { fenetreAvis.classList.remove("active"); produitAvis = null; }
  document.getElementById("fermer-avis").addEventListener("click", fermerAvis);
  fenetreAvis.addEventListener("click", function (e) { if (e.target === fenetreAvis) fermerAvis(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermerAvis(); });

  async function afficherListeAvis(id) {
    var zone = document.getElementById("avis-liste");
    zone.innerHTML = '<p class="chargement">…</p>';
    if (!session.fstore || !session.db) { zone.innerHTML = ""; return; }
    try {
      var snap = await session.fstore.getDocs(
        session.fstore.query(
          session.fstore.collection(session.db, "avis"),
          session.fstore.where("produit", "==", id),
          session.fstore.where("visible", "==", true)
        )
      );
      var liste = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .sort(function (a, b) { return (b.date && b.date.seconds || 0) - (a.date && a.date.seconds || 0); });
      if (!liste.length) {
        zone.innerHTML = '<p class="note">' + esc(FH.t("avis.aucun")) + "</p>";
        return;
      }
      zone.innerHTML = "";
      liste.forEach(function (v) {
        var art = document.createElement("article");
        art.className = "avis-item";
        var quand = v.date ? new Date(v.date.seconds * 1000).toLocaleDateString(FH.etat.lang === "ar" ? "ar" : FH.etat.lang) : "";
        art.innerHTML =
          '<p class="etoiles" aria-hidden="true">' + etoiles(v.note) + "</p>" +
          '<p class="avis-texte">' + esc(v.texte) + "</p>" +
          '<footer><strong>' + esc(v.nom || FH.t("nav.account")) + "</strong> <span>" + esc(quand) + "</span></footer>";
        zone.appendChild(art);
      });
    } catch (e) {
      zone.innerHTML = "";
    }
  }

  var noteChoisie = 0;
  function majFormulaireAvis() {
    var form = document.getElementById("form-avis");
    var connecte = !!session.user;
    document.getElementById("avis-connect").hidden = connecte;
    form.querySelector('button[type="submit"]').disabled = !connecte;
    if (!connecte) {
      // Le clic sur le message renvoie vers la connexion.
      var p = document.getElementById("avis-connect");
      p.style.cursor = "pointer";
      p.onclick = function () { window.location.href = "compte.html"; };
    }
  }
  document.getElementById("notes-choix").querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      noteChoisie = Number(b.dataset.note);
      document.getElementById("notes-choix").querySelectorAll("button").forEach(function (x) {
        x.classList.toggle("choisi", Number(x.dataset.note) <= noteChoisie);
      });
    });
  });

  document.getElementById("form-avis").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!session.user) { window.location.href = "compte.html"; return; }
    var texte = document.getElementById("avis-texte").value.trim();
    if (!noteChoisie || texte.length < 2) return;
    if (!session.fstore || !session.db) return;
    var u = session.user;
    var prenom = (u.displayName || "").split(" ")[0] || FH.t("nav.account");
    try {
      // Un seul avis par personne et par modèle : on remplace l'ancien.
      var snap = await session.fstore.getDocs(
        session.fstore.query(
          session.fstore.collection(session.db, "avis"),
          session.fstore.where("produit", "==", produitAvis.id),
          session.fstore.where("uid", "==", u.uid)
        )
      );
      var donnees = {
        produit: produitAvis.id, uid: u.uid, nom: prenom,
        note: noteChoisie, texte: texte, visible: true,
        date: session.fstore.serverTimestamp()
      };
      if (snap.size) {
        await session.fstore.setDoc(session.fstore.doc(session.db, "avis", snap.docs[0].id), donnees);
      } else {
        await session.fstore.addDoc(session.fstore.collection(session.db, "avis"), donnees);
      }
      document.getElementById("avis-texte").value = "";
      noteChoisie = 0;
      document.getElementById("notes-choix").querySelectorAll("button").forEach(function (x) { x.classList.remove("choisi"); });
      await afficherListeAvis(produitAvis.id);
      await chargerStatsAvis();
      alert(FH.t("avis.merci"));
    } catch (err) {
      console.warn("Avis non enregistré.", err);
      alert(FH.t("avis.erreur"));
    }
  });

  function normaliser(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function filtrer() {
    var L = FH.etat.lang;
    var q = normaliser(recherche.value.trim());
    var type = categorie.value;
    var min = prixMin.value ? FH.versEuro(Number(prixMin.value)) : 0;
    var max = prixMax.value ? FH.versEuro(Number(prixMax.value)) : Infinity;
    var visibles = 0;
    grille.querySelectorAll(".porte").forEach(function (carte) {
      var p = PRODUITS.filter(function (x) { return x.id === carte.dataset.id; })[0];
      var texte = normaliser([p.id, p.fr.n, p.fr.d, p.en.n, p.ar.n, (p[L] || p.fr).d].join(" "));
      var ok = (!q || texte.indexOf(q) > -1) &&
        (type === "tous" || p.types.indexOf(type) > -1) &&
        p.eur >= min - 0.01 && p.eur <= max + 0.01;
      carte.style.display = ok ? "" : "none";
      if (ok) visibles++;
    });
    // Si le catalogue géré est vide, seul le message d'état dédié s'affiche.
    aucun.style.display = (visibles || !PRODUITS.length) ? "none" : "block";
  }

  [recherche, prixMin, prixMax].forEach(function (el) { el.addEventListener("input", filtrer); });
  categorie.addEventListener("change", filtrer);

  // États du catalogue géré : message dédié (chargement / vide / erreur),
  // dans la langue active — jamais écrasé par les traductions.
  var etatCatalogue = "pret"; // "chargement" | "pret" | "erreur"
  var infoCatalogue = document.getElementById("catalogue-info");
  var MESSAGES = {
    chargement: { fr: "Chargement du catalogue…", ar: "جاري تحميل الكتالوج…", en: "Loading the catalogue…" },
    erreur: { fr: "Le catalogue est momentanément indisponible. Merci de réessayer dans un instant.", ar: "الكتالوج غير متاح مؤقتًا. يرجى المحاولة بعد قليل.", en: "The catalogue is temporarily unavailable. Please try again shortly." },
    vide: { fr: "Aucune offre disponible pour le moment.", ar: "لا توجد عروض متاحة حاليًا.", en: "No offers available at the moment." }
  };
  function majInfoCatalogue() {
    if (!infoCatalogue) return;
    var L = MESSAGES.chargement[FH.etat.lang] ? FH.etat.lang : "fr";
    var txt = "";
    if (etatCatalogue === "chargement") txt = MESSAGES.chargement[L];
    else if (etatCatalogue === "erreur") txt = MESSAGES.erreur[L];
    else if (!PRODUITS.length) txt = MESSAGES.vide[L];
    infoCatalogue.textContent = txt;
    // la classe .aucun-resultat vaut display:none : affichage via style inline
    infoCatalogue.style.display = txt ? "block" : "none";
  }

  // Changement de devise : convertit les valeurs saisies dans les filtres
  var deviseAvant = FH.etat.cur;
  document.addEventListener("fh:change", function (e) {
    if (e.detail.cur !== deviseAvant) {
      [prixMin, prixMax].forEach(function (el) {
        if (!el.value) return;
        var eur = deviseAvant === "EUR" ? Number(el.value) : Number(el.value) / FH.taux;
        el.value = e.detail.cur === "EUR" ? Math.round(eur) : Math.round((eur * FH.taux) / 1000) * 1000;
      });
      deviseAvant = e.detail.cur;
    }
    rendre();
    majInfoCatalogue();
  });

  // Connexion / déconnexion : met à jour favoris et formulaire d'avis
  document.addEventListener("fh:user", function () {
    chargerFavoris();
    if (fenetreAvis.classList.contains("active") && produitAvis) majFormulaireAvis();
  });

  // Fenêtre de devis
  var fenetre = document.getElementById("fenetre");
  var formulaire = document.getElementById("formulaire");
  var produitChoisi = null;

  function ouvrir(p) {
    produitChoisi = p;
    document.getElementById("produit").value = (p[FH.etat.lang] || p.fr).n + " — " + FH.prix(p.eur);
    var u = null;
    try { u = JSON.parse(FH.lire("fh-user", "null")); } catch (e) {}
    var pre = false;
    if (u) {
      var nom = document.getElementById("nom"), tel = document.getElementById("telephone"), mail = document.getElementById("email");
      if (!nom.value && (u.prenom || u.nom)) { nom.value = [u.prenom, u.nom].filter(Boolean).join(" "); pre = true; }
      if (!tel.value && u.telephone) { tel.value = u.telephone; pre = true; }
      if (!mail.value && u.email) { mail.value = u.email; pre = true; }
    }
    document.getElementById("prefill").classList.toggle("visible", pre);
    fenetre.classList.add("active");
    document.getElementById("nom").focus();
  }
  function fermer() { fenetre.classList.remove("active"); }
  document.getElementById("fermer").addEventListener("click", fermer);
  fenetre.addEventListener("click", function (e) { if (e.target === fenetre) fermer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermer(); });

  // Enregistre la demande dans l'espace client (si connecté).
  async function memoriserDemande(d) {
    if (!session.user || !session.fstore || !session.db) return;
    try {
      await session.fstore.addDoc(session.fstore.collection(session.db, "devis"), {
        uid: session.user.uid,
        nom: String(d.get("nom") || "").slice(0, 80),
        telephone: String(d.get("telephone") || "").slice(0, 30),
        email: String(d.get("email") || "").slice(0, 120),
        adresse: String(d.get("adresse") || "").slice(0, 200),
        produit: produitChoisi ? (produitChoisi.fr && produitChoisi.fr.n || "") : String(d.get("produit") || "").slice(0, 80),
        message: String(d.get("message") || "").slice(0, 1000),
        statut: "nouveau",
        langue: FH.etat.lang,
        date: session.fstore.serverTimestamp()
      });
    } catch (e) { console.warn("Demande non enregistrée dans l'espace client.", e); }
  }

  formulaire.addEventListener("submit", async function (e) {
    e.preventDefault();
    var d = new FormData(formulaire);
    await memoriserDemande(d);
    var nomFr = produitChoisi ? produitChoisi.fr.n : d.get("produit");
    var prixTxt = produitChoisi ? FH.prix(produitChoisi.eur) : "";
    var sujet = encodeURIComponent("Demande de devis - " + nomFr);
    var corps = encodeURIComponent(
      "Bonjour FAHIMA PORTES,\n\n" +
      "Je souhaite demander un devis pour : " + nomFr + (prixTxt ? " (" + prixTxt + ")" : "") + "\n\n" +
      "Nom et prénom : " + d.get("nom") + "\n" +
      "Téléphone : " + d.get("telephone") + "\n" +
      "E-mail : " + d.get("email") + "\n" +
      "Adresse du projet : " + d.get("adresse") + "\n" +
      "Langue du client : " + FH.etat.lang.toUpperCase() + "\n\n" +
      "Ma demande :\n" + d.get("message")
    );
    window.location.href = "mailto:islamefh2@gmail.com?subject=" + sujet + "&body=" + corps;
  });

  // Envoi du devis par WhatsApp (message dans la langue active)
  document.getElementById("envoyer-wa").addEventListener("click", async function () {
    if (!formulaire.reportValidity()) return;
    var d = new FormData(formulaire);
    await memoriserDemande(d);
    var L = FH.etat.lang;
    var prod = produitChoisi ? (produitChoisi[L] || produitChoisi.fr) : null;
    var nomModele = prod ? prod.n : d.get("produit");
    var prixTxt = produitChoisi ? FH.prix(produitChoisi.eur) : "";
    var msg =
      FH.t("form.wa.intro") + " : " + nomModele + (prixTxt ? " (" + prixTxt + ")" : "") + "\n\n" +
      FH.t("form.wa.name") + " : " + d.get("nom") + "\n" +
      FH.t("form.wa.phone") + " : " + d.get("telephone") + "\n" +
      FH.t("form.wa.email") + " : " + d.get("email") + "\n" +
      FH.t("form.wa.address") + " : " + d.get("adresse") + "\n\n" +
      FH.t("form.wa.msg") + " :\n" + d.get("message");
    window.open("https://wa.me/33784885023?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });

  // Source des offres :
  // - Firebase non configuré : liste d'aperçu statique (aucun admin actif).
  // - Firebase configuré : les offres viennent uniquement de Firestore.
  //   Base vide = catalogue vide ; erreur = message d'indisponibilité visible.
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "A_REMPLIR") {
    etatCatalogue = "chargement";
    PRODUITS = [];
    rendre();
    majInfoCatalogue();
    session.quand.then(async function () {
      try {
        var F = session.fstore;
        // Requête publique simple (filtre visible uniquement, sans orderBy :
        // un index composé serait sinon exigé par Firestore). Tri côté navigateur.
        var snap = await F.getDocs(F.query(F.collection(session.db, "products"), F.where("visible", "==", true)));
        PRODUITS = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
          .sort(function (a, b) { return (a.ordre || 999) - (b.ordre || 999); });
        /* APERÇU UNIQUEMENT (site d'aperçu) — renommages appliqués côté navigateur
           en attendant la mise à jour des documents Firestore (products/double,
           products/signature, products/prestige). Seuls les libellés et catégories
           sont remplacés (jamais prix ni photo). À SUPPRIMER une fois ces documents
           mis à jour dans Firebase. Les données réelles ne sont pas modifiées ici. */
        if (location.hostname.indexOf("sites.pplx.app") > -1) {
          PRODUITS.forEach(function (p) {
            if (p.id === "double" || p.id === "signature" || p.id === "prestige") {
              PRODUITS_INITIAUX.forEach(function (s) {
                if (s.id === p.id) { p.types = s.types; p.fr = s.fr; p.ar = s.ar; p.en = s.en; }
              });
            }
          });
        }
        etatCatalogue = "pret";
        rendre();
        majInfoCatalogue();
        chargerStatsAvis();
        chargerFavoris();
        if (!PRODUITS.length) console.warn("Catalogue Firestore vide : aucune offre visible. Ajoutez des offres depuis l'administration (admin.html).");
      } catch (e) {
        console.warn("Catalogue géré indisponible.", e);
        etatCatalogue = "erreur";
        PRODUITS = [];
        rendre();
        majInfoCatalogue();
      }
    });
  } else {
    rendre();
  }
})();
