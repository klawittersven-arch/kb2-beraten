/* Gemeinsame Hilfsfunktionen für alle Seiten (Programmlogik – Texte stehen in inhalte.js). */
(function () {
  'use strict';

  /* ---------- Speicher: jeder Zugriff abgesichert, Seite läuft auch ohne ---------- */
  function lager(art) {
    try {
      var s = window[art];
      var probe = '__kb2_probe__';
      s.setItem(probe, '1');
      s.removeItem(probe);
      return s;
    } catch (e) {
      return null;
    }
  }

  function lesen(s, schluessel) {
    if (!s) return null;
    try {
      var roh = s.getItem(schluessel);
      return roh === null ? null : JSON.parse(roh);
    } catch (e) {
      return null;
    }
  }

  function schreiben(s, schluessel, wert) {
    if (!s) return false;
    try {
      if (wert === null || wert === undefined) s.removeItem(schluessel);
      else s.setItem(schluessel, JSON.stringify(wert));
      return true;
    } catch (e) {
      return false;
    }
  }

  var sitzungLager = lager('sessionStorage');
  var dauerLager = lager('localStorage');

  var Speicher = {
    // Nur für diesen Tab (übersteht Neuladen)
    sitzung: {
      lesen: function (k) { return lesen(sitzungLager, k); },
      schreiben: function (k, w) { return schreiben(sitzungLager, k, w); }
    },
    // Dauerhaft auf dem Gerät; ohne localStorage Ausweichen auf sessionStorage
    dauer: {
      lesen: function (k) {
        var w = lesen(dauerLager, k);
        return w !== null ? w : lesen(sitzungLager, k);
      },
      schreiben: function (k, w) {
        return schreiben(dauerLager, k, w) || schreiben(sitzungLager, k, w);
      }
    }
  };

  /* ---------- „Erledigt“-Haken auf der Startseite (gilt 12 Stunden) ---------- */
  var ERLEDIGT_GUELTIG_MS = 12 * 3600000;
  var Erledigt = {
    merken: function (seite) { Speicher.dauer.schreiben('kb2_erledigt_' + seite, Date.now()); },
    zuruecknehmen: function (seite) { Speicher.dauer.schreiben('kb2_erledigt_' + seite, null); },
    ist: function (seite) {
      var um = Speicher.dauer.lesen('kb2_erledigt_' + seite);
      return typeof um === 'number' && um <= Date.now() + 60000 && Date.now() - um < ERLEDIGT_GUELTIG_MS;
    }
  };

  /* ---------- Kleine Helfer ---------- */
  function element(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function ersetzen(vorlage, werte) {
    return String(vorlage).replace(/\{(\w+)\}/g, function (_, k) {
      return werte[k] !== undefined ? werte[k] : '';
    });
  }

  // Text mit **fett** und \n (Zeilenumbruch) in ein Element schreiben – ohne innerHTML
  function formatiert(tag, klasse, text) {
    var e = element(tag, klasse);
    String(text).split('\n').forEach(function (zeile, z) {
      if (z > 0) e.appendChild(document.createElement('br'));
      zeile.split('**').forEach(function (teil, i) {
        if (!teil) return;
        e.appendChild(i % 2 ? element('strong', 'betont', teil) : document.createTextNode(teil));
      });
    });
    return e;
  }

  function ruhig() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- Vornamen prüfen (Handy) ---------- */
  var ERLAUBT = /^[A-Za-z0-9ÄÖÜäöüßÀ-ÖØ-öø-ÿ _-]+$/;
  var ERSATZ = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's' };

  function normalisieren(text) {
    var t = String(text).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
    var aus = '';
    for (var i = 0; i < t.length; i++) {
      var z = ERSATZ[t[i]] || t[i];
      if (z >= 'a' && z <= 'z') aus += z;
    }
    return aus.replace(/(.)\1+/g, '$1'); // doppelte Buchstaben zusammenziehen
  }

  // Ergebnis: '' (in Ordnung), 'laenge', 'zeichen' oder 'wort'
  function namePruefen(name) {
    if (typeof name !== 'string') return 'zeichen';
    var n = name.trim().replace(/\s+/g, ' ');
    if (n.length < 2 || n.length > 20) return 'laenge';
    if (!ERLAUBT.test(n)) return 'zeichen';
    var norm = normalisieren(n);
    var liste = (window.CONFIG && window.CONFIG.SPERRWOERTER) || [];
    for (var i = 0; i < liste.length; i++) {
      var wort = normalisieren(liste[i]);
      if (wort && norm.indexOf(wort) !== -1) return 'wort';
    }
    return '';
  }

  function zufallsId(laenge) {
    var zeichen = 'abcdefghijkmnpqrstuvwxyz23456789';
    var aus = '';
    var zahlen = new Uint8Array(laenge);
    (window.crypto || window.msCrypto).getRandomValues(zahlen);
    for (var i = 0; i < laenge; i++) aus += zeichen[zahlen[i] % zeichen.length];
    return aus;
  }

  /* ---------- Offline-Fähigkeit: Service Worker anmelden ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* ohne Offline-Modus weiter */ });
    });
  }

  window.APP = {
    Speicher: Speicher,
    Erledigt: Erledigt,
    element: element,
    ersetzen: ersetzen,
    formatiert: formatiert,
    ruhig: ruhig,
    namePruefen: namePruefen,
    zufallsId: zufallsId
  };
})();
