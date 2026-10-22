/* Catalogue FAHIMA PORTES — produits, filtres et demande de devis.
   Les offres affichées proviennent de Firestore dès que Firebase est configuré
   (gestion via admin.html) ; sinon la liste ci-dessous sert d'aperçu. */
import { PRODUITS_INITIAUX } from "./produits-initiaux.js";
import { firebaseConfig } from "./firebase-config.js";

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

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

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
        '<div class="informations">' +
        "<h2>" + esc(x.n) + "</h2>" +
        '<p class="type">' + esc(types) + "</p>" +
        '<p class="description">' + esc(x.d) + "</p>" +
        '<p class="prix"><small>' + esc(FH.t("cat.from")) + "</small>" + esc(FH.prix(p.eur)) + "</p>" +
        '<ul class="details">' + x.f.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
        '<button class="devis" type="button">' + esc(FH.t("cat.quote")) + "</button>" +
        "</div>";
      var image = a.querySelector("img");
      image.src = p.img; // affectation directe : jamais insérée dans du HTML
      image.alt = x.n;
      a.querySelector(".devis").addEventListener("click", function () { ouvrir(p); });
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

  formulaire.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(formulaire);
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
  document.getElementById("envoyer-wa").addEventListener("click", function () {
    if (!formulaire.reportValidity()) return;
    var d = new FormData(formulaire);
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
    var v = "10.12.2";
    etatCatalogue = "chargement";
    PRODUITS = [];
    rendre();
    majInfoCatalogue();
    Promise.all([
      import("https://www.gstatic.com/firebasejs/" + v + "/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/" + v + "/firebase-firestore.js")
    ]).then(async function (mods) {
      var app = mods[0].initializeApp(firebaseConfig);
      var F = mods[1];
      var bdd = F.getFirestore(app);
      // Requête publique simple (filtre visible uniquement, sans orderBy :
      // un index composé serait sinon exigé par Firestore). Tri côté navigateur.
      var snap = await F.getDocs(F.query(F.collection(bdd, "products"), F.where("visible", "==", true)));
      PRODUITS = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })
        .sort(function (a, b) { return (a.ordre || 999) - (b.ordre || 999); });
      etatCatalogue = "pret";
      rendre();
      majInfoCatalogue();
      if (!PRODUITS.length) console.warn("Catalogue Firestore vide : aucune offre visible. Ajoutez des offres depuis l'administration (admin.html).");
    }).catch(function (e) {
      console.warn("Catalogue géré indisponible.", e);
      etatCatalogue = "erreur";
      PRODUITS = [];
      rendre();
      majInfoCatalogue();
    });
  } else {
    rendre();
  }
})();
