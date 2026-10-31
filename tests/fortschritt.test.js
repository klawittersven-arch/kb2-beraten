/* Fortschritt am Beamer – Ende-zu-Ende-Test mit lokalem Cloudflare-Worker (wrangler dev).
 * Mehrere „Handys“ (je ein Browser-Kontext, 390 × 844) und ein „Laptop“ (1600 × 900).
 * Voraussetzung: im Ordner worker/ einmal „npm install“. */
'use strict';
const H = require('./hilfen');

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

// Wartet, bis eine Bedingung im Browser erfüllt ist (für die Abfrage alle 2 s)
async function bis(seite, fn, arg, ms = 12000) {
  try { await seite.waitForFunction(fn, arg, { timeout: ms, polling: 250 }); return true; } catch (e) { return false; }
}

(async () => {
  const worker = await H.workerStarten(8791);
  const { server, basis } = await H.serverStarten({ fortschrittUrl: worker.url });
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  let laptop, raum;

  try {
    // ---------- Laptop: Raum starten ----------
    console.log('\n== Beamer-Seite: Raum starten');
    const lctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    laptop = await lctx.newPage();
    H.beobachten(laptop, protokoll, 'laptop');
    await laptop.goto(basis + 'fortschritt.html');
    H.pruefe(await laptop.locator('#start').isVisible(), 'Startseite sichtbar');
    H.pruefe(await laptop.locator('#starten').isEnabled(), '„Neuen Raum starten“ ist bedienbar (Adresse eingetragen)');
    await laptop.click('#starten');
    await laptop.waitForSelector('#tafel:not([hidden])');
    raum = (await laptop.locator('#raum-code').innerText()).trim();
    H.pruefe(/^\d{4}$/.test(raum), `Raumcode angezeigt: ${raum}`);
    H.pruefe(await laptop.locator('#warten').isVisible(), '„Warten auf die ersten Anmeldungen …“');
    const schluessel = await laptop.evaluate(() => JSON.parse(localStorage.getItem('kb2_lehrer_raum')).schluessel);

    // ---------- Handy 1: Anmeldung mit Fehlern, dann richtig ----------
    console.log('\n== Handy 1 (Mia): Anmeldung');
    const h1ctx = await browser.newContext(H.MOBIL);
    const h1 = await h1ctx.newPage();
    H.beobachten(h1, protokoll, 'handy1');
    await h1.goto(basis + 'bremsen.html');
    H.pruefe(await h1.locator('#anmelde-form').isVisible(), 'Anmeldekasten oben in der Übung');
    const T = await h1.evaluate(() => INHALTE.melden);
    const fehlerText = () => h1.locator('#anmelde-fehler').innerText();
    await h1.click('.anmelde-los');
    H.pruefe((await fehlerText()) === T.fehlerNameLaenge, 'Leerer Name → Hinweis');
    await h1.fill('#anmelde-name', 'Fuuuck');
    await h1.fill('#anmelde-raum', raum);
    await h1.click('.anmelde-los');
    H.pruefe((await fehlerText()) === T.fehlerNameWort, 'Sperrwort → Hinweis');
    await h1.fill('#anmelde-name', 'Mia');
    await h1.fill('#anmelde-raum', '12');
    await h1.click('.anmelde-los');
    H.pruefe((await fehlerText()) === T.fehlerRaum, 'Zu kurzer Raumcode → Hinweis');
    const falsch = raum === '1000' ? '1001' : '1000';
    await h1.fill('#anmelde-raum', falsch);
    await h1.click('.anmelde-los');
    H.pruefe(await bis(h1, (t) => document.getElementById('anmelde-fehler') && document.getElementById('anmelde-fehler').textContent === t, T.fehlerUnbekannt), 'Unbekannter Raumcode → Hinweis');
    await h1.fill('#anmelde-raum', raum);
    await h1.click('.anmelde-los');
    H.pruefe(await bis(h1, () => !!document.querySelector('.anmeldung.angemeldet')), 'Angemeldet-Zeile erscheint');
    H.pruefe((await h1.locator('.anmeldung.angemeldet').innerText()).includes('Mia') && (await h1.locator('.anmeldung.angemeldet').innerText()).includes(raum), 'Zeile zeigt Name und Raum');

    // Laptop sieht Mia mit 0 gelösten Aufgaben
    H.pruefe(await bis(laptop, () => [...document.querySelectorAll('.s-name')].some((e) => e.textContent === 'Mia')), 'Beamer zeigt „Mia“');
    // drei Karten richtig lösen
    const rk = await h1.evaluate(() => INHALTE.bremsen);
    const kartenRk = rk.abschnitte.filter((a) => !a.art).flatMap((a) => a.karten);
    const gesamtRk = kartenRk.length + rk.abschnitte.filter((a) => a.art === 'reihenfolge').reduce((n, a) => n + a.schritte.length, 0);
    const dreiVon = '3/' + gesamtRk;
    for (const k of kartenRk.slice(0, 3)) await h1.click(`#karte-${k.nummer} [data-kuerzel="${k.richtig}"]`);
    H.pruefe(await bis(laptop, (d) => {
      const z = [...document.querySelectorAll('.s-karte')].find((k) => k.querySelector('.s-name').textContent === 'Mia');
      return z && z.querySelector('[data-seite="bremsen"] .s-zahl').textContent.startsWith(d);
    }, dreiVon), `Beamer: Mia A1 ${dreiVon} (nach drei Antworten)`);
    H.pruefe(await bis(h1, (t) => document.getElementById('anmelde-status').textContent === t, T.gesendet), 'Handy zeigt „Stand übertragen“');

    // ---------- Handy 2: Ben, Raumcode per Adresse, C1 komplett ----------
    console.log('\n== Handy 2 (Ben): C1 vollständig');
    const h2ctx = await browser.newContext(H.MOBIL);
    const h2 = await h2ctx.newPage();
    H.beobachten(h2, protokoll, 'handy2');
    await h2.goto(basis + 'angehoerige.html?raum=' + raum);
    H.pruefe((await h2.inputValue('#anmelde-raum')) === raum, 'Raumcode aus der Adresse vorausgefüllt');
    await h2.fill('#anmelde-name', '  Ben  ');
    await h2.click('.anmelde-los');
    await bis(h2, () => !!document.querySelector('.anmeldung.angemeldet'));
    const si = await h2.evaluate(() => INHALTE.angehoerige);
    for (const k of si.abschnitte.flatMap((a) => a.karten)) await h2.click(`#karte-${k.nummer} [data-kuerzel="${k.richtig}"]`);
    H.pruefe(await bis(laptop, () => {
      const z = [...document.querySelectorAll('.s-karte')].find((k) => k.querySelector('.s-name').textContent === 'Ben');
      return z && z.querySelector('[data-seite="angehoerige"] .s-zahl').textContent === '6/6 ✓';
    }), 'Beamer: Ben C1 6/6 ✓');
    H.pruefe(await bis(laptop, () => /C1 fertig: 1/.test(document.getElementById('zusammenfassung').textContent)), 'Zusammenfassung „C1 fertig: 1“');

    // ---------- Handy 3: zweite Mia, durchgeklickt ----------
    console.log('\n== Handy 3 (zweite Mia): durchklicken');
    const h3ctx = await browser.newContext(H.MOBIL);
    const h3 = await h3ctx.newPage();
    H.beobachten(h3, protokoll, 'handy3');
    await h3.goto(basis + 'angehoerige.html');
    await h3.fill('#anmelde-name', 'Mia');
    await h3.fill('#anmelde-raum', raum);
    await h3.click('.anmelde-los');
    await bis(h3, () => !!document.querySelector('.anmeldung.angemeldet'));
    for (const a of si.abschnitte) {
      for (const k of a.karten) {
        const kuerzel = (k.antworten || a.antworten).map((x) => x.kuerzel);
        for (const f of kuerzel.filter((x) => x !== k.richtig)) await h3.click(`#karte-${k.nummer} [data-kuerzel="${f}"]`);
        await h3.click(`#karte-${k.nummer} [data-kuerzel="${k.richtig}"]`);
      }
    }
    H.pruefe(await bis(laptop, () => [...document.querySelectorAll('.s-name')].some((e) => e.textContent === 'Mia (2)')), 'Gleicher Vorname → „Mia (2)“');
    H.pruefe(await bis(laptop, () => [...document.querySelectorAll('[data-seite="angehoerige"] .s-zahl')].some((e) => e.textContent === '6/6 ⚠')), 'Durchgeklickt → „6/6 ⚠“');

    // ---------- Handy 1 wechselt zu C1: bleibt angemeldet ----------
    console.log('\n== Handy 1 wechselt zur zweiten Übung');
    await h1.goto(basis + 'angehoerige.html');
    H.pruefe(await bis(h1, () => !!document.querySelector('.anmeldung.angemeldet')), 'Auf der zweiten Übung weiter angemeldet');
    await h1.click('#karte-1 [data-kuerzel="' + si.abschnitte[0].karten[0].richtig + '"]');
    H.pruefe(await bis(laptop, (d) => [...document.querySelectorAll('.s-karte')].some((k) =>
      k.querySelector('[data-seite="bremsen"] .s-zahl').textContent.startsWith(d) &&
      k.querySelector('[data-seite="angehoerige"] .s-zahl').textContent.startsWith('1/6')), dreiVon), `Beamer: dieselbe Zeile zeigt A1 ${dreiVon} und C1 1/6`);

    // ---------- Offline: Stand wird nachgereicht ----------
    console.log('\n== Offline');
    await h2ctx.setOffline(true);
    await h2.click('#noch-einmal');
    H.pruefe(await bis(h2, (t) => document.getElementById('anmelde-status').textContent === t, T.offline), 'Ohne Netz: „Gerade keine Verbindung …“');
    await warte(1500);
    await h2ctx.setOffline(false);
    H.pruefe(await bis(laptop, () => {
      const z = [...document.querySelectorAll('.s-karte')].find((k) => k.querySelector('.s-name').textContent === 'Ben');
      return z && z.querySelector('[data-seite="angehoerige"] .s-zahl').textContent === '0/6';
    }, null, 20000), 'Nach Rückkehr des Netzes: Beamer zeigt Ben 0/6');

    // ---------- Namen verbergen ----------
    console.log('\n== Namen verbergen');
    await laptop.click('#namen');
    const namen = await laptop.$$eval('.s-name', (n) => n.map((x) => x.textContent));
    H.pruefe(namen.every((n) => /^Person \d+$/.test(n)) && !(await laptop.locator('#raster').innerText()).includes('Ben'), 'Namen verborgen → „Person 1 …“', namen);
    await laptop.click('#namen');
    H.pruefe((await laptop.locator('#raster').innerText()).includes('Ben'), 'Namen wieder sichtbar');

    // ---------- Neu laden: Raum bleibt ----------
    await laptop.reload();
    await laptop.waitForSelector('#tafel:not([hidden])');
    H.pruefe((await laptop.locator('#raum-code').innerText()).trim() === raum, 'Neuladen der Beamer-Seite: derselbe Raum');
    H.pruefe(await bis(laptop, () => document.querySelectorAll('.s-karte').length === 3), 'Neuladen: alle drei Einträge wieder da');

    // ---------- Entfernen ----------
    console.log('\n== Moderation');
    await laptop.locator('.s-karte', { hasText: 'Ben' }).click();
    H.pruefe((await laptop.locator('#dialog-text').innerText()).includes('Ben'), 'Klick auf Eintrag → Rückfrage');
    await laptop.click('#dialog-ja');
    H.pruefe(await bis(laptop, () => ![...document.querySelectorAll('.s-name')].some((e) => e.textContent === 'Ben')), 'Ben entfernt');
    await h2.click('#karte-1 [data-kuerzel="' + si.abschnitte[0].karten[0].richtig + '"]');
    H.pruefe(await bis(h2, (t) => document.getElementById('anmelde-fehler') && document.getElementById('anmelde-fehler').textContent === t, T.fehlerEntfernt), 'Handy von Ben: Hinweis „von der Lehrkraft entfernt“');
    await warte(2500);
    H.pruefe(!(await laptop.locator('#raster').innerText()).includes('Ben'), 'Ben taucht nicht von selbst wieder auf');

    // Liste leeren
    await laptop.click('#leeren');
    await laptop.click('#dialog-ja');
    H.pruefe(await bis(laptop, () => document.querySelectorAll('.s-karte').length === 0), '„Liste leeren“ entfernt alle Einträge');
    await h1.click('#karte-2 [data-kuerzel="' + si.abschnitte[0].karten[1].richtig + '"]');
    H.pruefe(await bis(laptop, () => [...document.querySelectorAll('.s-name')].some((e) => e.textContent === 'Mia')), 'Weiterarbeitendes Handy erscheint wieder');

    // ---------- Ohne Anzeige ----------
    console.log('\n== Ohne Anzeige weiter');
    const h4ctx = await browser.newContext(H.MOBIL);
    const h4 = await h4ctx.newPage();
    H.beobachten(h4, protokoll, 'handy4');
    let anfragen = 0;
    h4.on('request', (r) => { if (r.url().startsWith(worker.url)) anfragen++; });
    await h4.goto(basis + 'bremsen.html');
    await h4.click('#anmelde-ohne');
    H.pruefe(await h4.locator('#anmelde-doch').isVisible() && !(await h4.locator('#anmelde-form').count()), '„Ohne Anzeige weiter“ → nur noch kleiner Knopf');
    await h4.click(`#karte-1 [data-kuerzel="${kartenRk[0].richtig}"]`);
    await warte(800);
    H.pruefe(anfragen === 0, 'Ohne Anmeldung keine einzige Anfrage an den Worker', anfragen);
    await h4.reload();
    H.pruefe(await h4.locator('#anmelde-doch').isVisible(), 'Entscheidung bleibt nach Neuladen erhalten');

    // ---------- Schutz der Daten ----------
    console.log('\n== Zugriffsschutz');
    const ohne = await fetch(`${worker.url}/api/stand?raum=${raum}&schluessel=FALSCHFALSCHFALSCHFALSCH`);
    H.pruefe(ohne.status === 403, 'Stand ohne richtigen Schlüssel → 403');
    const mit = await (await fetch(`${worker.url}/api/stand?raum=${raum}&schluessel=${schluessel}`)).json();
    const felder = new Set(mit.geraete.flatMap((g) => Object.keys(g)));
    H.pruefe([...felder].every((f) => ['geraeteId', 'name', 'seiten', 'um'].includes(f)), 'Gespeichert sind nur Geräte-ID, Name, Stand je Übung, Zeit', [...felder]);
    const kaputt = await fetch(`${worker.url}/api/melden`, { method: 'POST', body: JSON.stringify({ raum, geraeteId: 'abcdefgh1', name: '<img src=x>', seite: 'sicher', geloest: 1, gesamt: 10, status: 'arbeitet' }) });
    H.pruefe(kaputt.status === 400, 'Name mit HTML wird vom Worker abgelehnt');
    const zuGross = await fetch(`${worker.url}/api/melden`, { method: 'POST', body: 'x'.repeat(5000) });
    H.pruefe(zuGross.status === 400, 'Zu große Anfrage wird abgelehnt');

    await laptop.screenshot({ path: 'ergebnisse/fortschritt_beamer.png' });
    await h1.screenshot({ path: 'ergebnisse/fortschritt_handy.png' });
  } finally {
    // ---------- Ablauf nach der Lebensdauer (eigener Worker mit 3 Sekunden) ----------
    console.log('\n== Automatisches Löschen');
    const kurz = await H.workerStarten(8792, 0.05);
    try {
      const r = await (await fetch(kurz.url + '/api/raum', { method: 'POST' })).json();
      await fetch(kurz.url + '/api/melden', { method: 'POST', body: JSON.stringify({ raum: r.raum, geraeteId: 'abcdefgh12', name: 'Mia', seite: 'sicher', geloest: 1, gesamt: 10, status: 'arbeitet' }) });
      const vorher = await fetch(`${kurz.url}/api/stand?raum=${r.raum}&schluessel=${r.schluessel}`);
      await warte(4500);
      const nachher = await fetch(`${kurz.url}/api/stand?raum=${r.raum}&schluessel=${r.schluessel}`);
      H.pruefe(vorher.status === 200 && nachher.status === 404, 'Nach Ablauf der Lebensdauer ist der Raum samt Daten gelöscht', [vorher.status, nachher.status]);
    } finally { kurz.beenden(); }

    console.log('\n== Allgemein');
    H.pruefe(protokoll.konsole.filter((k) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED|net::ERR/.test(k)).length === 0, 'Keine Programmfehler in der Konsole', protokoll.konsole);
    H.pruefe(protokoll.extern.length === 0, 'Keine Anfragen an fremde Adressen', protokoll.extern);
    await browser.close();
    server.close();
    worker.beenden();
  }
  process.exit(H.ergebnis() ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
