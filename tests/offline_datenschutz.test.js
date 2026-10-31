/* Offline-Fähigkeit, Datenschutz (keine fremden Adressen, keine Cookies) und Dateigrößen. */
'use strict';
const fs = require('fs');
const path = require('path');
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  const ctx = await browser.newContext(H.MOBIL);
  const p = await ctx.newPage();
  H.beobachten(p, protokoll, 'offline');

  console.log('\n== Offline (Service Worker)');
  await p.goto(basis + 'index.html');
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload(); // jetzt steuert der Service Worker die Seite
  const imCache = await p.evaluate(async () => {
    const namen = await caches.keys();
    const c = await caches.open(namen.find((n) => n.startsWith('kb2-beraten-')));
    return (await c.keys()).map((r) => new URL(r.url).pathname.split('/').pop());
  });
  const sw = fs.readFileSync(path.join(H.DOCS, 'sw.js'), 'utf8');
  const liste = JSON.parse(sw.match(/var DATEIEN = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
  H.pruefe(liste.filter((d) => d !== './').every((d) => imCache.includes(d)), 'Alle Dateien liegen im Offline-Speicher', imCache);
  const seiten = fs.readdirSync(H.DOCS).filter((d) => /\.(html|js|css)$/.test(d) && d !== 'sw.js');
  H.pruefe(seiten.every((d) => liste.includes(d)), 'sw.js listet jede HTML-, JS- und CSS-Datei', seiten.filter((d) => !liste.includes(d)));

  await ctx.setOffline(true);
  for (const s of ['index.html', 'bremsen.html', 'phasen.html', 'angehoerige.html', 'fortschritt.html']) {
    await p.goto(basis + s);
    const ok = s === 'index.html' ? (await p.locator('.startlink').count()) === 3 : s === 'fortschritt.html' ? (await p.locator('#start-titel').innerText()).length > 0 : (await p.locator('.antwort').count()) > 0;
    H.pruefe(ok, `${s} funktioniert ohne Netz`);
  }
  await p.goto(basis + 'bremsen.html');
  await p.click('#karte-1 [data-kuerzel="' + (await p.evaluate(() => INHALTE.bremsen.abschnitte[0].karten[0].richtig)) + '"]');
  H.pruefe((await p.locator('#karte-1.ist-richtig').count()) === 1, 'Antworten funktioniert auch offline');
  await ctx.setOffline(false);

  console.log('\n== Datenschutz');
  const cookies = await ctx.cookies();
  H.pruefe(cookies.length === 0, 'Keine Cookies', cookies);
  const lesen = (d) => fs.readFileSync(path.join(H.DOCS, d), 'utf8');
  const dateien = fs.readdirSync(H.DOCS).filter((d) => /\.(html|js|css)$/.test(d));
  // Einzige erlaubte fremde Adresse: der eigene Worker in config.js (FORTSCHRITT_URL)
  const quelltext = dateien.map((d) => (d === 'config.js' ? lesen(d).replace(/FORTSCHRITT_URL: '[^']*'/, "FORTSCHRITT_URL: ''") : lesen(d))).join('\n');
  H.pruefe(!/https?:\/\//.test(quelltext.replace(/https?:\/\/(www\.)?w3\.org[^\s'"]*/g, '')), 'Keine externen Adressen im Quelltext (keine Schriften, Skripte, Analyse)');
  const sendende = dateien.filter((d) => /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/.test(lesen(d)));
  H.pruefe(JSON.stringify(sendende.sort()) === JSON.stringify(['fortschritt.js', 'melden.js', 'sw.js']),
    'Daten senden nur melden.js (Fortschritt, nach Anmeldung) und fortschritt.js (Beamer); sw.js lädt eigene Dateien', sendende);
  H.pruefe(!/fetch\(\s*['"]https?:/.test(quelltext) && /BASIS \+ '\/api\/melden'/.test(lesen('melden.js')), 'melden.js sendet nur an CONFIG.FORTSCHRITT_URL');
  H.pruefe(!/innerHTML\s*=/.test(quelltext), 'Kein innerHTML (Texte werden sicher eingefügt)');

  console.log('\n== Dateigrößen');
  const gross = fs.readdirSync(H.DOCS).map((d) => [d, fs.statSync(path.join(H.DOCS, d)).size]);
  const summe = gross.reduce((s, [, g]) => s + g, 0);
  H.pruefe(summe < 150 * 1024, `Gesamtgröße ${(summe / 1024).toFixed(1)} KB (< 150 KB)`);

  H.pruefe(protokoll.konsole.length === 0, 'Keine Fehler in der Konsole', protokoll.konsole);
  H.pruefe(protokoll.extern.length === 0, 'Keine Anfragen an fremde Adressen', protokoll.extern);

  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
