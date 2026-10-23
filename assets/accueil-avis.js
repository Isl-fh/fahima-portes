/* Page d'accueil — témoignages réels (collection « avis ») + formulaire de note. */
import { session } from "./session.js?v=20261102";

(function () {
  "use strict";

  var t = function (k, v) { return window.FH ? FH.t(k, v) : k; };
  var esc = function (s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  var noteAccueil = 0;

  function majEtoiles() {
    document.querySelectorAll("#notes-accueil button").forEach(function (b) {
      b.classList.toggle("choisie", Number(b.dataset.note) <= noteAccueil);
    });
  }

  function afficherAvis(liste) {
    var grille = document.getElementById("temoignages-reels");
    var vide = document.getElementById("temoignages-vide");
    if (!grille) return;
    grille.querySelectorAll(".temoignage").forEach(function (e) { e.remove(); });
    if (!liste.length) { if (vide) vide.hidden = false; return; }
    if (vide) vide.hidden = true;
    liste.forEach(function (a) {
      var art = document.createElement("article");
      art.className = "temoignage";
      var etoiles = "";
      for (var i = 1; i <= 5; i++) etoiles += i <= a.note ? "★" : "☆";
      art.innerHTML =
        '<p class="etoiles" aria-hidden="true">' + etoiles + "</p>" +
        "<blockquote>" + esc(a.texte) + "</blockquote>" +
        "<footer><strong>" + esc(a.nom) + "</strong></footer>";
      grille.appendChild(art);
    });
  }

  async function chargerAvis() {
    var F = session.fstore;
    if (!F || !session.db) return;
    try {
      var snap = await F.getDocs(F.query(F.collection(session.db, "avis"), F.where("visible", "==", true)));
      var liste = [];
      snap.forEach(function (d) {
        var a = d.data();
        if (a.texte && a.note) liste.push({ nom: a.nom || "", note: a.note, texte: a.texte, date: a.date });
      });
      liste.sort(function (a, b) { return (b.date && b.date.seconds || 0) - (a.date && a.date.seconds || 0); });
      afficherAvis(liste.slice(0, 6));
    } catch (e) { /* avis indisponibles : la section reste discrète */ }
  }

  function majEtatConnexion(user) {
    var form = document.getElementById("form-avis-accueil");
    var lien = document.getElementById("avis-non-connecte");
    if (!form) return;
    if (user) {
      form.hidden = false; if (lien) lien.hidden = true;
      var prenom = (user.displayName || "").split(" ")[0] || "";
      var champNom = document.getElementById("avis-nom-accueil");
      if (champNom && !champNom.value) champNom.value = prenom;
    } else {
      form.hidden = true; if (lien) lien.hidden = false;
    }
  }

  document.addEventListener("fh:user", function (e) { majEtatConnexion(e.detail ? e.detail.user : null); });

  document.querySelectorAll("#notes-accueil button").forEach(function (b) {
    b.addEventListener("click", function () { noteAccueil = Number(b.dataset.note); majEtoiles(); });
  });

  document.getElementById("form-avis-accueil").addEventListener("submit", async function (e) {
    e.preventDefault();
    var msg = document.getElementById("avis-accueil-msg");
    var F = session.fstore;
    var texte = document.getElementById("avis-texte-accueil").value.trim();
    var nom = document.getElementById("avis-nom-accueil").value.trim();
    function erreur(txt) { msg.hidden = false; msg.textContent = txt; }
    if (!session.user) return erreur(t("testi.form.login"));
    if (!noteAccueil) return erreur(t("testi.form.stars"));
    if (!nom || texte.length < 2) return erreur(t("err.required"));
    try {
      await F.addDoc(F.collection(session.db, "avis"), {
        produit: "", uid: session.user.uid, nom: nom, note: noteAccueil,
        texte: texte, date: F.serverTimestamp(), visible: true
      });
      document.getElementById("form-avis-accueil").reset();
      noteAccueil = 0; majEtoiles();
      msg.hidden = false; msg.textContent = t("testi.form.ok");
      msg.className = "alerte info";
      chargerAvis();
    } catch (err) {
      erreur(t("testi.form.err") + (err && err.code ? " (" + err.code + ")" : ""));
    }
  });

  session.quand.then(function () {
    chargerAvis();
    majEtatConnexion(session.user);
  });
})();
