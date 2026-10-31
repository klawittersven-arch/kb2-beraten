/* Fortschritt am Beamer – Anmeldung und Meldungen auf dem Handy (Programmlogik, keine Texte).
 *
 * Oben in jeder Übung erscheint ein kleiner Kasten: Vorname + Raumcode → „Mitmachen“.
 * Danach meldet das Handy nach jeder Antwort { geloest, gesamt, status } dieser Übung an
 * den Cloudflare-Worker (CONFIG.FORTSCHRITT_URL). Ohne Anmeldung, ohne Netz oder ohne
 * eingetragene Adresse funktionieren die Übungen wie gewohnt.
 *
 * Schnittstelle für app.js:  APPMelden.stand(seite, geloest, gesamt, status)
 */
(function () {
  'use strict';

  var K = window.APP;
  var el = K.element;
  var C = window.CONFIG || {};
  var T = INHALTE.melden;
  var BASIS = String(C.FORTSCHRITT_URL || '').replace(/\/+$/, '');
  var platz = document.getElementById('anmelde-platz');
  if (!BASIS || !platz) return;

  var SCHL_ANMELDUNG = 'kb2_anmeldung';
  var SCHL_GERAET = 'kb2_geraet';
  var SCHL_OHNE = 'kb2_ohne_anzeige';
  var GUELTIG_MS = (Number(C.RAUMCODE_GUELTIG_STUNDEN) || 3) * 3600000;

  /* ---------- gespeicherte Angaben ---------- */
  function geraeteId(neu) {
    var id = neu ? null : K.Speicher.dauer.lesen(SCHL_GERAET);
    if (typeof id !== 'string' || !/^[a-z0-9]{8,40}$/.test(id)) {
      id = K.zufallsId(16);
      K.Speicher.dauer.schreiben(SCHL_GERAET, id);
    }
    return id;
  }

  function anmeldung() {
    var a = K.Speicher.dauer.lesen(SCHL_ANMELDUNG);
    if (!a || typeof a !== 'object' || typeof a.um !== 'number' || Date.now() - a.um > GUELTIG_MS) return null;
    if (!/^\d{4}$/.test(a.raum) || K.namePruefen(a.name) !== '') return null;
    return a;
  }

  function ohneAnzeige() {
    var um = K.Speicher.dauer.lesen(SCHL_OHNE);
    return typeof um === 'number' && Date.now() - um < GUELTIG_MS;
  }

  /* ---------- Senden ---------- */
  var staende = {};   // seite → { geloest, gesamt, status }
  var offen = {};     // seite → true, solange der aktuelle Stand noch nicht angekommen ist
  var timer = null;
  var unterwegs = false;
  var wartezeit = 0;
  var sendeZustand = '';   // 'sendet' | 'gesendet' | 'offline'
  var meldung = '';        // Fehlermeldung im Formular
  var formularOffen = false;

  function planen(ms) {
    clearTimeout(timer);
    timer = setTimeout(function () { senden(false); }, ms);
  }

  function anfrage(koerper, keepalive) {
    return fetch(BASIS + '/api/melden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(koerper),
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      keepalive: !!keepalive
    }).then(function (r) { return r.status; });
  }

  function senden(keepalive) {
    var a = anmeldung();
    var seiten = Object.keys(offen);
    if (!a || !seiten.length || unterwegs) return;
    var seite = seiten[0];
    var s = staende[seite];
    unterwegs = true;
    zustandSetzen('sendet');
    anfrage({ raum: a.raum, geraeteId: a.geraeteId, name: a.name, seite: seite,
      geloest: s.geloest, gesamt: s.gesamt, status: s.status }, keepalive)
      .then(function (code) {
        unterwegs = false;
        if (code === 200) {
          if (staende[seite] === s) delete offen[seite];
          wartezeit = 0;
          a.um = Date.now();  // Anmeldung bleibt gültig, solange gearbeitet wird
          K.Speicher.dauer.schreiben(SCHL_ANMELDUNG, a);
          zustandSetzen('gesendet');
          if (Object.keys(offen).length) planen(50);
        } else if (code === 404) {
          abmelden(T.fehlerUnbekannt, false);
        } else if (code === 410) {
          abmelden(T.fehlerEntfernt, true);
        } else if (code === 409) {
          abmelden(T.fehlerVoll, false);
        } else if (code >= 500) {
          nochmal();
        } else {
          delete offen[seite];  // ungültige Meldung – nicht endlos wiederholen
          zustandSetzen('gesendet');
        }
      })
      .catch(function () {
        unterwegs = false;
        nochmal();
      });
  }

  function nochmal() {
    wartezeit = Math.min(wartezeit ? wartezeit * 2 : 3000, 30000);
    zustandSetzen('offline');
    planen(wartezeit);
  }

  function abmelden(text, neueId) {
    var a = K.Speicher.dauer.lesen(SCHL_ANMELDUNG) || {};
    K.Speicher.dauer.schreiben(SCHL_ANMELDUNG, null);
    if (neueId) geraeteId(true);
    vorbelegt = { name: a.name || '', raum: a.raum || '' };
    meldung = text;
    formularOffen = true;
    zeigen();
  }

  function zustandSetzen(z) {
    sendeZustand = z;
    var e = document.getElementById('anmelde-status');
    if (e) {
      e.textContent = z === 'sendet' ? T.sendet : z === 'offline' ? T.offline : z === 'gesendet' ? T.gesendet : '';
      e.className = 'anmelde-status ' + z;
    }
  }

  /* ---------- Anzeige ---------- */
  var vorbelegt = { name: '', raum: '' };
  try {
    var r = new URLSearchParams(location.search).get('raum');
    if (r && /^\d{4}$/.test(r)) vorbelegt.raum = r;
  } catch (e) { /* alte Browser */ }

  function feld(id, label, wert, art) {
    var w = el('div', 'anmelde-feld');
    var l = el('label', null, label);
    l.setAttribute('for', id);
    var i = el('input');
    i.id = id;
    i.type = 'text';
    i.value = wert || '';
    i.autocomplete = 'off';
    if (art === 'code') {
      i.inputMode = 'numeric';
      i.maxLength = 4;
      i.setAttribute('pattern', '[0-9]*');
      i.className = 'code';
    } else {
      i.maxLength = 20;
      i.setAttribute('autocapitalize', 'words');
      i.spellcheck = false;
    }
    w.appendChild(l);
    w.appendChild(i);
    return w;
  }

  function zeigen() {
    platz.textContent = '';
    var a = anmeldung();

    if (a && !formularOffen) {
      var zeile = el('div', 'anmeldung angemeldet');
      var t = el('p', 'anmelde-wer');
      t.appendChild(document.createTextNode('📺 ' + K.ersetzen(T.angemeldet, { name: a.name, raum: a.raum }) + ' · '));
      var aendern = el('button', 'textknopf', T.aendern);
      aendern.type = 'button';
      aendern.id = 'anmelde-aendern';
      aendern.addEventListener('click', function () {
        vorbelegt = { name: a.name, raum: a.raum };
        meldung = '';
        formularOffen = true;
        zeigen();
        document.getElementById('anmelde-name').focus();
      });
      t.appendChild(aendern);
      zeile.appendChild(t);
      var st = el('p', 'anmelde-status');
      st.id = 'anmelde-status';
      st.setAttribute('aria-live', 'polite');
      zeile.appendChild(st);
      platz.appendChild(zeile);
      zustandSetzen(sendeZustand);
      return;
    }

    if (!formularOffen && ohneAnzeige()) {
      var doch = el('button', 'textknopf anmelde-doch', T.dochMitmachen);
      doch.type = 'button';
      doch.id = 'anmelde-doch';
      doch.addEventListener('click', function () {
        K.Speicher.dauer.schreiben(SCHL_OHNE, null);
        formularOffen = true;
        zeigen();
        document.getElementById('anmelde-name').focus();
      });
      platz.appendChild(doch);
      return;
    }

    var form = el('form', 'anmeldung');
    form.id = 'anmelde-form';
    form.noValidate = true;
    form.appendChild(el('h2', null, T.titel));
    form.appendChild(el('p', 'anmelde-text', T.text));
    var felder = el('div', 'anmelde-felder');
    felder.appendChild(feld('anmelde-name', T.nameLabel, vorbelegt.name, 'name'));
    felder.appendChild(feld('anmelde-raum', T.raumLabel, vorbelegt.raum, 'code'));
    form.appendChild(felder);
    var fehler = el('p', 'anmelde-fehler', meldung);
    fehler.id = 'anmelde-fehler';
    fehler.setAttribute('role', 'alert');
    form.appendChild(fehler);
    var knoepfe = el('div', 'anmelde-knoepfe');
    var los = el('button', 'knopf anmelde-los', T.mitmachen);
    los.type = 'submit';
    knoepfe.appendChild(los);
    var ohne = el('button', 'knopf knopf-zweit', T.ohne);
    ohne.type = 'button';
    ohne.id = 'anmelde-ohne';
    ohne.addEventListener('click', function () {
      if (!anmeldung()) K.Speicher.dauer.schreiben(SCHL_OHNE, Date.now());
      formularOffen = false;
      meldung = '';
      zeigen();
    });
    knoepfe.appendChild(ohne);
    form.appendChild(knoepfe);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      anmelden(document.getElementById('anmelde-name').value, document.getElementById('anmelde-raum').value, los);
    });
    platz.appendChild(form);
  }

  function anmelden(name, raum, knopf) {
    name = String(name).trim().replace(/\s+/g, ' ');
    raum = String(raum).trim();
    var f = K.namePruefen(name);
    var text = f === 'laenge' ? T.fehlerNameLaenge : f === 'zeichen' ? T.fehlerNameZeichen : f === 'wort' ? T.fehlerNameWort :
      (!/^\d{4}$/.test(raum) ? T.fehlerRaum : '');
    vorbelegt = { name: name, raum: raum };
    if (text) {
      meldung = text;
      zeigen();
      return;
    }
    var a = { name: name, raum: raum, geraeteId: geraeteId(false), um: Date.now() };
    var seite = Object.keys(staende)[0];
    var s = staende[seite] || { geloest: 0, gesamt: 1, status: 'arbeitet' };
    knopf.disabled = true;
    anfrage({ raum: raum, geraeteId: a.geraeteId, name: name, seite: seite,
      geloest: s.geloest, gesamt: s.gesamt, status: s.status }, false)
      .then(function (code) {
        knopf.disabled = false;
        if (code === 404) { meldung = T.fehlerUnbekannt; zeigen(); return; }
        if (code === 409) { meldung = T.fehlerVoll; zeigen(); return; }
        if (code === 410) { geraeteId(true); anmelden(name, raum, knopf); return; }
        if (code === 400) { meldung = T.fehlerNameZeichen; zeigen(); return; }
        fertigAngemeldet(a, code === 200 ? seite : null);
      })
      .catch(function () {
        // Ohne Netz trotzdem merken – der Stand wird nachgereicht (falscher Code fällt dann auf).
        knopf.disabled = false;
        fertigAngemeldet(a, null);
        nochmal();
      });
  }

  function fertigAngemeldet(a, bestaetigteSeite) {
    K.Speicher.dauer.schreiben(SCHL_ANMELDUNG, a);
    K.Speicher.dauer.schreiben(SCHL_OHNE, null);
    meldung = '';
    formularOffen = false;
    Object.keys(staende).forEach(function (s) { if (s !== bestaetigteSeite) offen[s] = true; });
    if (bestaetigteSeite) sendeZustand = 'gesendet';
    zeigen();
    if (Object.keys(offen).length) planen(50);
  }

  /* ---------- Ereignisse ---------- */
  window.addEventListener('online', function () { wartezeit = 0; planen(100); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && Object.keys(offen).length) senden(true);
    if (document.visibilityState === 'visible' && Object.keys(offen).length) planen(100);
  });

  window.APPMelden = {
    // Von app.js nach jeder Änderung aufgerufen
    stand: function (seite, geloest, gesamt, status) {
      var alt = staende[seite];
      if (alt && alt.geloest === geloest && alt.gesamt === gesamt && alt.status === status) return;
      staende[seite] = { geloest: geloest, gesamt: gesamt, status: status };
      offen[seite] = true;
      if (anmeldung()) planen(alt ? 300 : 50);
    }
  };

  zeigen();
})();
