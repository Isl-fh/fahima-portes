/* Catalogue FAHIMA PORTES — produits, filtres et demande de devis */
(function () {
  // Prix de référence en euros (convertis automatiquement en dinars)
  var PRODUITS = [
    { id: "geometrique", img: "produit-01.webp", eur: 4599.99, types: ["blindee", "fer-forge", "simple"],
      fr: { n: "Modèle Géométrique", d: "Un décor géométrique travaillé pour une entrée moderne et sécurisée.", f: ["Serrure multipoints", "Structure renforcée", "Finition noire premium"] },
      ar: { n: "نموذج هندسي", d: "زخرفة هندسية متقنة لمدخل عصري وآمن.", f: ["قفل متعدد النقاط", "هيكل معزز", "تشطيب أسود فاخر"] },
      en: { n: "Geometric model", d: "A finely worked geometric pattern for a modern, secure entrance.", f: ["Multi-point lock", "Reinforced structure", "Premium black finish"] } },
    { id: "horizon", img: "produit-02.webp", eur: 5299.99, types: ["blindee", "simple"],
      fr: { n: "Modèle Horizon", d: "Une finition grise élégante avec des lignes horizontales.", f: ["Blindage renforcé", "Poignée longue", "Isolation renforcée"] },
      ar: { n: "نموذج هورايزن", d: "تشطيب رمادي أنيق بخطوط أفقية.", f: ["تصفيح معزز", "مقبض طويل", "عزل معزز"] },
      en: { n: "Horizon model", d: "An elegant grey finish with horizontal lines.", f: ["Reinforced armour", "Long handle", "Enhanced insulation"] } },
    { id: "diagonale", img: "produit-03.webp", eur: 3899.99, types: ["blindee", "simple"],
      fr: { n: "Modèle Diagonale", d: "Une finition effet bois avec des lignes diagonales.", f: ["Blindage renforcé", "Finition effet bois", "Pose sur devis"] },
      ar: { n: "نموذج دياغونال", d: "تشطيب بمظهر الخشب مع خطوط مائلة.", f: ["تصفيح معزز", "تشطيب بمظهر الخشب", "التركيب حسب عرض السعر"] },
      en: { n: "Diagonal model", d: "A wood-effect finish with diagonal lines.", f: ["Reinforced armour", "Wood-effect finish", "Installation on quote"] } },
    { id: "lumiere", img: "produit-04.webp", eur: 1899.99, types: ["chambre", "simple"],
      fr: { n: "Modèle Lumière", d: "Une porte claire et lumineuse avec un insert décoratif.", f: ["Design élégant", "Finition claire", "Pose sur devis"] },
      ar: { n: "نموذج لوميير", d: "باب فاتح ومشرق بلمسة زخرفية.", f: ["تصميم أنيق", "تشطيب فاتح", "التركيب حسب عرض السعر"] },
      en: { n: "Lumière model", d: "A light, bright door with a decorative insert.", f: ["Elegant design", "Light finish", "Installation on quote"] } },
    { id: "signature", img: "produit-05.webp", eur: 5799.99, types: ["blindee", "simple"],
      fr: { n: "Modèle Signature", d: "Une porte effet bois avec un panneau central premium.", f: ["Blindage haute résistance", "Finition personnalisable", "Serrure sécurisée"] },
      ar: { n: "نموذج سيغناتور", d: "باب بمظهر الخشب مع لوحة مركزية فاخرة.", f: ["تصفيح عالي المقاومة", "تشطيب حسب الطلب", "قفل آمن"] },
      en: { n: "Signature model", d: "A wood-effect door with a premium central panel.", f: ["High-resistance armour", "Customisable finish", "Secure lock"] } },
    { id: "double", img: "produit-06.webp", eur: 8799.99, types: ["blindee", "double", "fer-forge"],
      fr: { n: "Modèle Double", d: "Une grande porte à double vantail pour les entrées prestigieuses.", f: ["Double vantail", "Poignées ergonomiques", "Structure renforcée"] },
      ar: { n: "النموذج المزدوج", d: "باب كبير بمصراعين للمداخل الفخمة.", f: ["مصراعان", "مقابض مريحة", "هيكل معزز"] },
      en: { n: "Double model", d: "A large double-leaf door for prestigious entrances.", f: ["Double leaf", "Ergonomic handles", "Reinforced structure"] } },
    { id: "contraste", img: "produit-07.webp", eur: 6499.99, types: ["blindee", "simple", "fer-forge"],
      fr: { n: "Modèle Contraste", d: "Un modèle bicolore avec une finition bois sombre.", f: ["Design bicolore", "Serrure sécurisée", "Finitions modernes"] },
      ar: { n: "نموذج كونتراست", d: "نموذج بلونين مع تشطيب خشبي داكن.", f: ["تصميم بلونين", "قفل آمن", "تشطيبات عصرية"] },
      en: { n: "Contrast model", d: "A two-tone model with a dark wood finish.", f: ["Two-tone design", "Secure lock", "Modern finishes"] } },
    { id: "prestige", img: "produit-08.webp", eur: 7299.99, types: ["double", "chambre"],
      fr: { n: "Modèle Prestige", d: "Une porte double effet bois avec des vitrages décoratifs.", f: ["Double vantail", "Vitrages décoratifs", "Finition bois premium"] },
      ar: { n: "نموذج بريستيج", d: "باب مزدوج بمظهر الخشب مع زجاج زخرفي.", f: ["مصراعان", "زجاج زخرفي", "تشطيب خشبي فاخر"] },
      en: { n: "Prestige model", d: "A wood-effect double door with decorative glazing.", f: ["Double leaf", "Decorative glazing", "Premium wood finish"] } },
    { id: "sanitaire", img: "produit-04.webp", eur: 899.99, types: ["sanitaire", "simple"],
      fr: { n: "Modèle Sanitaire", d: "Une solution claire et pratique pour les espaces sanitaires.", f: ["Entretien facile", "Finition résistante", "Pose sur devis"] },
      ar: { n: "نموذج الحمام", d: "حل عملي وفاتح اللون للحمامات.", f: ["سهل التنظيف", "تشطيب مقاوم", "التركيب حسب عرض السعر"] },
      en: { n: "Bathroom model", d: "A light, practical solution for bathrooms.", f: ["Easy to clean", "Durable finish", "Installation on quote"] } }
  ];

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
        '<img src="' + p.img + '" alt="' + esc(x.n) + '" width="1024" height="1024" loading="lazy">' +
        '<div class="informations">' +
        "<h2>" + esc(x.n) + "</h2>" +
        '<p class="type">' + esc(types) + "</p>" +
        '<p class="description">' + esc(x.d) + "</p>" +
        '<p class="prix"><small>' + esc(FH.t("cat.from")) + "</small>" + esc(FH.prix(p.eur)) + "</p>" +
        '<ul class="details">' + x.f.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
        '<button class="devis" type="button">' + esc(FH.t("cat.quote")) + "</button>" +
        "</div>";
      a.querySelector(".devis").addEventListener("click", function () { ouvrir(p); });
      grille.insertBefore(a, aucun);
    });
    document.querySelectorAll(".sym").forEach(function (s) { s.textContent = FH.symbole(); });
    var lo = Math.min.apply(null, PRODUITS.map(function (p) { return p.eur; }));
    var hi = Math.max.apply(null, PRODUITS.map(function (p) { return p.eur; }));
    prixMin.placeholder = FH.nombre(FH.convertir(lo));
    prixMax.placeholder = FH.nombre(FH.convertir(hi));
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
    aucun.style.display = visibles ? "none" : "block";
  }

  [recherche, prixMin, prixMax].forEach(function (el) { el.addEventListener("input", filtrer); });
  categorie.addEventListener("change", filtrer);

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

  rendre();
})();
