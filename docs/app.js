/* Programmlogik der Übungsseiten (a1.html, b1.html, c1.html).
   Alle Texte stehen in inhalte.js – hier bitte nichts an Texten ändern. */
(function () {
  'use strict';

  var K = window.APP;
  var el = K.element;
  var seiteId = document.body.getAttribute('data-seite');
  var A = INHALTE.allgemein;
  var seite = INHALTE[seiteId];
  if (!seite) return;

  var speicherSchluessel = 'kb2_stand_' + seiteId;

  /* ---------- Aufgaben aus den Abschnitten sammeln ----------
     Jede Karte ist eine Aufgabe; bei einer Reihenfolge-Aufgabe zählt jeder Schritt. */
  var karten = [];   // { karte, abschnitt }
  var reihen = [];   // { abschnitt, aIndex }
  seite.abschnitte.forEach(function (ab, aIndex) {
    if (ab.art === 'reihenfolge') reihen.push({ abschnitt: ab, aIndex: aIndex });
    else ab.karten.forEach(function (k) { karten.push({ karte: k, abschnitt: ab }); });
  });

  function antwortenFuer(eintrag) {
    return eintrag.karte.antworten || eintrag.abschnitt.antworten;
  }

  function richtigeListe(karte) {
    return Array.isArray(karte.richtig) ? karte.richtig : [karte.richtig];
  }

  function erklaerungFuer(karte, kuerzel) {
    if (karte.erklaerung && typeof karte.erklaerung === 'object') return karte.erklaerung[kuerzel] || '';
    return karte.erklaerung || '';
  }

  // Ändern sich die Inhalte, passt ein gespeicherter Stand nicht mehr.
  var fingerabdruck = JSON.stringify([
    karten.map(function (e) {
      return [e.karte.nummer, richtigeListe(e.karte), antwortenFuer(e).map(function (a) { return a.kuerzel; })];
    }),
    reihen.map(function (r) { return r.abschnitt.schritte.map(function (s) { return s.text; }); })
  ]);

  /* ---------- Zustand ---------- */
  function nullen(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(0);
    return a;
  }

  // Zufällige Reihenfolge, aber nie schon die richtige
  function mischen(n) {
    var r = [];
    for (var i = 0; i < n; i++) r.push(i);
    if (n < 2) return r;
    do {
      for (var j = n - 1; j > 0; j--) {
        var z = Math.floor(Math.random() * (j + 1));
        var t = r[j]; r[j] = r[z]; r[z] = t;
      }
    } while (r.every(function (v, idx) { return v === idx; }));
    return r;
  }

  function leererZustand() {
    return {
      fp: fingerabdruck,
      karten: karten.map(function () { return { falsch: [], richtig: null }; }),
      reihen: reihen.map(function (r) {
        var n = r.abschnitt.schritte.length;
        return { mischung: mischen(n), gelegt: 0, fehlerJe: nullen(n), falschJetzt: [] };
      })
    };
  }

  function zustandGueltig(z) {
    if (!z || z.fp !== fingerabdruck) return false;
    if (!Array.isArray(z.karten) || z.karten.length !== karten.length) return false;
    if (!Array.isArray(z.reihen) || z.reihen.length !== reihen.length) return false;
    return z.reihen.every(function (rz, i) {
      var n = reihen[i].abschnitt.schritte.length;
      return rz && Array.isArray(rz.mischung) && rz.mischung.length === n &&
        Array.isArray(rz.fehlerJe) && rz.fehlerJe.length === n &&
        Array.isArray(rz.falschJetzt) && typeof rz.gelegt === 'number' && rz.gelegt >= 0 && rz.gelegt <= n;
    });
  }

  var zustand = K.Speicher.sitzung.lesen(speicherSchluessel);
  if (!zustandGueltig(zustand)) zustand = leererZustand();

  function speichern() {
    K.Speicher.sitzung.schreiben(speicherSchluessel, zustand);
  }

  function gesamtZahl() {
    var n = karten.length;
    reihen.forEach(function (r) { n += r.abschnitt.schritte.length; });
    return n;
  }

  function anzahlGeloest() {
    var n = 0;
    zustand.karten.forEach(function (k) { if (k.richtig) n++; });
    zustand.reihen.forEach(function (r) { n += r.gelegt; });
    return n;
  }

  function anzahlErsterVersuch() {
    var n = 0;
    zustand.karten.forEach(function (k) { if (k.richtig && k.falsch.length === 0) n++; });
    zustand.reihen.forEach(function (r) {
      for (var i = 0; i < r.gelegt; i++) if (r.fehlerJe[i] === 0) n++;
    });
    return n;
  }

  /* ---------- Aufbau der Seite ---------- */
  document.title = seite.titel + ' – ' + A.kopfzeile;
  document.getElementById('kopfzeile').textContent = A.kopfzeile;
  document.getElementById('titel').textContent = seite.titel;
  document.getElementById('anweisung').textContent = seite.anweisung;

  var fortschrittText = document.getElementById('fortschritt-text');
  var fortschrittBalken = document.getElementById('fortschritt-balken');
  var merksatzBereich = document.getElementById('merksatz-bereich');
  var nochEinmalKnopf = document.getElementById('noch-einmal');
  nochEinmalKnopf.textContent = A.nochEinmal;

  // Infokarten (aufklappbar)
  if (seite.infokarten && seite.infokarten.length) {
    var infoPlatz = document.getElementById('info-platz');
    var zugeklappt = seite.infokarten.some(function (i) { return !i.offen; });
    if (zugeklappt) infoPlatz.appendChild(el('p', 'info-hinweis', A.infoHinweis));
    seite.infokarten.forEach(function (info, i) {
      var d = el('details', 'info');
      d.id = 'info-' + (i + 1);
      if (info.offen) d.open = true;
      d.appendChild(el('summary', null, info.titel));
      var inhalt = el('div', 'info-inhalt');
      if (info.text) inhalt.appendChild(K.formatiert('p', null, info.text));
      if (info.punkte && info.punkte.length) {
        var ul = el('ul');
        info.punkte.forEach(function (p) { ul.appendChild(K.formatiert('li', null, p)); });
        inhalt.appendChild(ul);
      }
      if (info.merke) {
        var m = el('p', 'info-merke');
        m.appendChild(el('strong', null, 'Merke: '));
        m.appendChild(document.createTextNode(info.merke));
        inhalt.appendChild(m);
      }
      d.appendChild(inhalt);
      infoPlatz.appendChild(d);
    });
    if (seite.infoQuelle) infoPlatz.appendChild(el('p', 'quelle', seite.infoQuelle));
  }

  var abschnitteBereich = document.getElementById('abschnitte');
  var kartenElemente = [];
  var reihenElemente = [];

  seite.abschnitte.forEach(function (ab, aIndex) {
    var sek = el('section', 'abschnitt');
    sek.id = 'abschnitt-' + (aIndex + 1);
    sek.appendChild(el('h2', null, ab.ueberschrift));
    if (ab.anweisung) sek.appendChild(el('p', 'abschnitt-anweisung', ab.anweisung));
    abschnitteBereich.appendChild(sek);

    if (ab.art === 'reihenfolge') {
      reiheAufbauen(sek, reihenElemente.length, ab);
      return;
    }
    ab.karten.forEach(function (karte) {
      karteAufbauen(sek, kartenElemente.length, { karte: karte, abschnitt: ab });
    });
  });

  function karteAufbauen(sek, index, eintrag) {
    var karte = eintrag.karte;
    var antworten = antwortenFuer(eintrag);

    var art = el('article', 'karte');
    art.id = 'karte-' + karte.nummer;
    art.setAttribute('data-nummer', karte.nummer);

    var kopf = el('div', 'karte-kopf');
    var nummer = el('span', 'nummer', String(karte.nummer));
    nummer.setAttribute('aria-hidden', 'true');
    var aussage = el('p', 'aussage', karte.text);
    aussage.insertBefore(el('span', 'nur-vorlesen', 'Aufgabe ' + karte.nummer + ': '), aussage.firstChild);
    kopf.appendChild(nummer);
    kopf.appendChild(aussage);
    art.appendChild(kopf);

    var lang = antworten.some(function (a) { return a.text.length > 24; });
    var gruppe = el('div', 'knoepfe knoepfe-' + antworten.length + (lang ? ' knoepfe-lang' : ''));
    gruppe.setAttribute('role', 'group');
    gruppe.setAttribute('aria-label', 'Antwort zu Aufgabe ' + karte.nummer);
    var knoepfe = {};
    antworten.forEach(function (antwort) {
      var b = el('button', 'antwort');
      b.type = 'button';
      b.setAttribute('data-kuerzel', antwort.kuerzel);
      b.appendChild(el('span', 'symbol'));
      b.appendChild(el('span', 'beschriftung', antwort.text));
      b.addEventListener('click', function () { antworten_(index, antwort.kuerzel); });
      gruppe.appendChild(b);
      knoepfe[antwort.kuerzel] = b;
    });
    art.appendChild(gruppe);

    var rueck = el('div', 'rueckmeldung');
    rueck.setAttribute('aria-live', 'polite');
    art.appendChild(rueck);

    sek.appendChild(art);
    kartenElemente.push({ karte: art, knoepfe: knoepfe, rueck: rueck });
  }

  function reiheAufbauen(sek, r, ab) {
    var box = el('div', 'reihe');
    box.id = 'reihe-' + (r + 1);
    box.appendChild(el('p', 'reihe-label', A.reiheGelegt));
    var liste = el('ol', 'reihe-gelegt');
    box.appendChild(liste);
    var auswahlLabel = el('p', 'reihe-label', A.reiheAuswahl);
    box.appendChild(auswahlLabel);
    var auswahl = el('div', 'reihe-auswahl');
    auswahl.setAttribute('role', 'group');
    auswahl.setAttribute('aria-label', A.reiheAuswahl);
    box.appendChild(auswahl);
    var rueck = el('div', 'rueckmeldung');
    rueck.setAttribute('aria-live', 'polite');
    box.appendChild(rueck);
    sek.appendChild(box);
    reihenElemente.push({ box: box, liste: liste, auswahlLabel: auswahlLabel, auswahl: auswahl, rueck: rueck, abschnitt: ab });
  }

  /* ---------- Anzeige aus dem Zustand ---------- */
  function rueckRichtig(ziel, titel, text) {
    ziel.classList.add('ist-richtig');
    var t = el('p', 'rueck-titel');
    t.appendChild(el('span', 'symbol', '✓'));
    t.appendChild(document.createTextNode(' ' + titel));
    ziel.appendChild(t);
    if (text) ziel.appendChild(el('p', 'rueck-text', text));
  }

  function rueckFalsch(ziel, titel, tipp) {
    ziel.classList.add('ist-falsch');
    var f = el('p', 'rueck-titel');
    f.appendChild(el('span', 'symbol', '✗'));
    f.appendChild(document.createTextNode(' ' + titel));
    ziel.appendChild(f);
    var p = el('p', 'rueck-text');
    p.appendChild(el('strong', null, A.tippVorwort + ' '));
    p.appendChild(document.createTextNode(tipp));
    ziel.appendChild(p);
  }

  function karteZeigen(index) {
    var karte = karten[index].karte;
    var z = zustand.karten[index];
    var e = kartenElemente[index];

    e.karte.classList.toggle('ist-richtig', !!z.richtig);
    Object.keys(e.knoepfe).forEach(function (k) {
      var b = e.knoepfe[k];
      var istFalsch = z.falsch.indexOf(k) !== -1;
      var istRichtig = z.richtig === k;
      b.classList.toggle('falsch', istFalsch);
      b.classList.toggle('richtig', istRichtig);
      b.disabled = istFalsch || !!z.richtig;
      b.querySelector('.symbol').textContent = istRichtig ? '✓' : (istFalsch ? '✗' : '');
      var zusatz = istRichtig ? ' – richtig' : (istFalsch ? ' – falsch' : '');
      b.setAttribute('aria-label', b.querySelector('.beschriftung').textContent + zusatz);
    });

    e.rueck.textContent = '';
    e.rueck.className = 'rueckmeldung';
    if (z.richtig) rueckRichtig(e.rueck, A.richtigText, erklaerungFuer(karte, z.richtig));
    else if (z.falsch.length > 0) rueckFalsch(e.rueck, A.falschText, karte.tipp);
  }

  function reiheZeigen(r, fokus) {
    var ab = reihen[r].abschnitt;
    var z = zustand.reihen[r];
    var e = reihenElemente[r];
    var fertig = z.gelegt === ab.schritte.length;

    e.box.classList.toggle('ist-richtig', fertig);
    e.liste.textContent = '';
    if (z.gelegt === 0) e.liste.appendChild(el('li', 'leer', A.reiheNochLeer));
    for (var i = 0; i < z.gelegt; i++) {
      var li = el('li', 'gelegt');
      li.setAttribute('data-schritt', i);
      li.appendChild(el('span', 'gelegt-nummer', String(i + 1)));
      li.appendChild(el('span', 'gelegt-text', ab.schritte[i].text));
      e.liste.appendChild(li);
    }

    e.auswahl.textContent = '';
    e.auswahlLabel.hidden = fertig;
    e.auswahl.hidden = fertig;
    var ersterFreier = null;
    z.mischung.forEach(function (idx) {
      if (idx < z.gelegt) return;
      var istFalsch = z.falschJetzt.indexOf(idx) !== -1;
      var b = el('button', 'antwort schritt' + (istFalsch ? ' falsch' : ''));
      b.type = 'button';
      b.setAttribute('data-schritt', idx);
      b.appendChild(el('span', 'symbol', istFalsch ? '✗' : ''));
      b.appendChild(el('span', 'beschriftung', ab.schritte[idx].text));
      b.disabled = istFalsch;
      b.setAttribute('aria-label', ab.schritte[idx].text + (istFalsch ? ' – passt hier noch nicht' : ''));
      b.addEventListener('click', function () { schrittTippen(r, idx); });
      e.auswahl.appendChild(b);
      if (!istFalsch && !ersterFreier) ersterFreier = b;
    });

    e.rueck.textContent = '';
    e.rueck.className = 'rueckmeldung';
    if (fertig) rueckRichtig(e.rueck, A.reiheFertig, ab.erklaerung);
    else if (z.falschJetzt.length > 0) rueckFalsch(e.rueck, A.reiheFalsch, ab.schritte[z.gelegt].tipp);

    // Die Knöpfe wurden neu erzeugt: Fokus für Tastatur/Screenreader erhalten
    if (fokus && ersterFreier) ersterFreier.focus();
  }

  function fortschrittZeigen() {
    var n = anzahlGeloest();
    var y = gesamtZahl();
    fortschrittText.textContent = K.ersetzen(A.fortschritt, { x: n, y: y });
    fortschrittBalken.style.width = Math.round(n / y * 100) + '%';

    // Fortschritt am Beamer (nur wenn angemeldet; siehe melden.js)
    if (window.APPMelden) {
      var status = n < y ? 'arbeitet' :
        (anzahlErsterVersuch() < (seite.mindestensErsterVersuch || 0) ? 'durchklicken' : 'fertig');
      window.APPMelden.stand(seiteId, n, y, status);
    }
  }

  // Der Merksatz wird erst nach vollständiger Lösung in die Seite eingefügt.
  function merksatzZeigen(scrollen) {
    merksatzBereich.textContent = '';
    var gesamt = gesamtZahl();
    if (anzahlGeloest() !== gesamt) {
      merksatzBereich.hidden = true;
      return;
    }

    // Zu viele Fehlversuche (Durchklicken)? Dann kein Merksatz, sondern neu starten.
    var mindestens = seite.mindestensErsterVersuch || 0;
    var kasten;
    if (anzahlErsterVersuch() < mindestens) {
      kasten = el('section', 'durchklicken');
      kasten.setAttribute('role', 'alert');
      kasten.appendChild(el('h2', null, A.durchklickenTitel));
      kasten.appendChild(el('p', null, K.ersetzen(A.durchklickenText,
        { x: anzahlErsterVersuch(), y: gesamt, z: mindestens })));
      var neu = el('button', 'knopf durchklicken-knopf', A.durchklickenKnopf);
      neu.type = 'button';
      neu.addEventListener('click', zuruecksetzen);
      kasten.appendChild(neu);
    } else {
      K.Erledigt.merken(seiteId);
      kasten = el('section', 'merksatz');
      kasten.setAttribute('aria-labelledby', 'merksatz-ueberschrift');
      var h = el('h2', null, A.merksatzUeberschrift);
      h.id = 'merksatz-ueberschrift';
      kasten.appendChild(h);
      // Deutlicher Arbeitsauftrag VOR dem Merksatz: auf das Arbeitsblatt übertragen
      var link = (INHALTE.start.links || []).filter(function (l) { return l.seite === seiteId; })[0];
      var hinweis = el('p', 'merksatz-hinweis');
      var symbol = el('span', 'hinweis-symbol', '✍️');
      symbol.setAttribute('aria-hidden', 'true');
      hinweis.appendChild(symbol);
      hinweis.appendChild(el('span', 'hinweis-text',
        K.ersetzen(seite.merksatzHinweis || A.merksatzHinweis, { kurz: link ? link.kurz : '' })));
      kasten.appendChild(hinweis);
      kasten.appendChild(K.formatiert('p', 'merksatz-text', seite.merksatz));
      kasten.appendChild(el('p', 'erster-versuch',
        K.ersetzen(A.ersterVersuch, { x: anzahlErsterVersuch(), y: gesamt })));
    }
    merksatzBereich.appendChild(kasten);
    merksatzBereich.hidden = false;

    if (scrollen) {
      setTimeout(function () {
        kasten.scrollIntoView({ behavior: K.ruhig() ? 'auto' : 'smooth', block: 'center' });
      }, 150);
    }
  }

  function allesZeigen(scrollen) {
    for (var i = 0; i < karten.length; i++) karteZeigen(i);
    for (var r = 0; r < reihen.length; r++) reiheZeigen(r, false);
    fortschrittZeigen();
    merksatzZeigen(scrollen);
  }

  /* ---------- Antworten ---------- */
  function fertigGeworden(vorher) {
    var gesamt = gesamtZahl();
    if (vorher !== gesamt && anzahlGeloest() === gesamt) merksatzZeigen(true);
  }

  function antworten_(index, kuerzel) {
    var z = zustand.karten[index];
    if (z.richtig || z.falsch.indexOf(kuerzel) !== -1) return;
    var vorher = anzahlGeloest();

    if (richtigeListe(karten[index].karte).indexOf(kuerzel) !== -1) z.richtig = kuerzel;
    else z.falsch.push(kuerzel);

    speichern();
    karteZeigen(index);
    fortschrittZeigen();
    fertigGeworden(vorher);
  }

  function schrittTippen(r, idx) {
    var z = zustand.reihen[r];
    if (idx < z.gelegt || z.falschJetzt.indexOf(idx) !== -1) return;
    var vorher = anzahlGeloest();

    if (idx === z.gelegt) {
      z.gelegt++;
      z.falschJetzt = [];
    } else {
      z.falschJetzt.push(idx);
      z.fehlerJe[z.gelegt]++;
    }

    speichern();
    reiheZeigen(r, true);
    fortschrittZeigen();
    fertigGeworden(vorher);
  }

  nochEinmalKnopf.addEventListener('click', zuruecksetzen);
  function zuruecksetzen() {
    K.Erledigt.zuruecknehmen(seiteId);
    zustand = leererZustand();
    speichern();
    allesZeigen(false);
    window.scrollTo({ top: 0, behavior: K.ruhig() ? 'auto' : 'smooth' });
  }

  allesZeigen(false);
})();
