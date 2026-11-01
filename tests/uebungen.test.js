/* Tests der Übungsseiten bremsen.html, phasen.html, angehoerige.html in Handygröße (390 × 844). */
'use strict';
const H = require('./hilfen');

(async () => {
  const { server, basis } = await H.serverStarten();
  const browser = await H.chromium.launch();
  const protokoll = { konsole: [], extern: [] };
  const handy = await browser.newContext(H.MOBIL);

  for (const seiteId of ['bremsen', 'phasen', 'angehoerige']) {
    console.log(`\n== ${seiteId}.html`);
    const p = await handy.newPage();
    H.beobachten(p, protokoll, seiteId);
    await p.goto(basis + seiteId + '.html');
    const daten = await p.evaluate((s) => INHALTE[s], seiteId);
    const A = await p.evaluate(() => INHALTE.allgemein);
    const karten = [];
    const reihen = [];
    daten.abschnitte.forEach((ab, i) => {
      if (ab.art === 'reihenfolge') reihen.push({ ab, nr: reihen.length + 1 });
      else ab.karten.forEach((k) => karten.push({ k, antworten: (k.antworten || ab.antworten).map((a) => a.kuerzel) }));
    });
    const gesamt = karten.length + reihen.reduce((s, r) => s + r.ab.schritte.length, 0);
    const merksatzRein = daten.merksatz.replace(/\*\*/g, '').split('\n')[0];
    const merksatzDa = () => p.evaluate((m) => document.body.innerText.includes(m), merksatzRein);

    // ---------- Aufbau ----------
    H.pruefe(!(await merksatzDa()), 'Merksatz steht vor dem Lösen nirgends in der Seite');
    H.pruefe((await p.locator('.karte').count()) === karten.length, `${karten.length} Karten`);
    const nummern = await p.$$eval('.karte .nummer', (n) => n.map((x) => x.textContent));
    H.pruefe(JSON.stringify(nummern) === JSON.stringify(karten.map((e) => String(e.k.nummer))), 'Nummerierung fortlaufend', nummern);
    H.pruefe((await p.locator('section.abschnitt h2').count()) === daten.abschnitte.length, `${daten.abschnitte.length} Teile mit Überschrift`);
    H.pruefe((await p.locator('a[href="index.html"], a[href="./"]').count()) === 0, 'Kein Link zur Übersicht (SuS bleiben in ihrer Aufgabe)');
    H.pruefe((await p.locator('#fortschritt-text').innerText()) === `0 von ${gesamt} gelöst`, `Fortschritt „0 von ${gesamt} gelöst“`);

    const infos = daten.infokarten || [];
    H.pruefe((await p.locator('details.info').count()) === infos.length, `${infos.length} Infokarte(n)`);
    for (let i = 0; i < infos.length; i++) {
      const d = p.locator(`#info-${i + 1}`);
      H.pruefe((await d.evaluate((x) => x.open)) === !!infos[i].offen, `Infokarte ${i + 1} ist ${infos[i].offen ? 'offen' : 'zugeklappt'}`);
      if (!infos[i].offen) {
        await p.click(`#info-${i + 1} summary`);
        H.pruefe(await d.evaluate((x) => x.open), `Infokarte ${i + 1} lässt sich aufklappen`);
      }
      const text = await d.innerText();
      H.pruefe(infos[i].punkte.every((pkt) => text.includes(pkt.replace(/\*\*/g, ''))), `Infokarte ${i + 1}: alle Punkte sichtbar, **fett** ohne Sternchen`);
    }

    // Maße (mit aufgeklappten Infokarten)
    const masse = await p.$$eval('.antwort', (b) => b.map((x) => [x.getBoundingClientRect().height, parseFloat(getComputedStyle(x).fontSize)]));
    H.pruefe(masse.every(([h, f]) => h >= 48 && f >= 17), 'Antwortknöpfe ≥ 48 px hoch, Schrift ≥ 17 px');
    const schriften = await p.$$eval('p, li, span, button, summary, h1, h2, h3', (e) => e.filter((x) => x.offsetParent && x.textContent.trim()).map((x) => parseFloat(getComputedStyle(x).fontSize)));
    H.pruefe(Math.min(...schriften) >= 17, 'Sichtbare Schrift überall ≥ 17 px', Math.min(...schriften));
    const breite = await p.evaluate(() => document.documentElement.scrollWidth);
    H.pruefe(breite <= 390, 'Kein waagrechtes Scrollen bei 390 px', breite);
    const ueberlauf = await p.$$eval('.antwort', (b) => b.filter((x) => x.scrollWidth > x.clientWidth + 1).length);
    H.pruefe(ueberlauf === 0, 'Kein Text ragt aus einem Knopf heraus', ueberlauf);

    // ---------- Durchgang 1: zuerst alle falschen Antworten ----------
    for (const { k, antworten } of karten) {
      for (const f of antworten.filter((x) => x !== k.richtig)) {
        const knopf = p.locator(`#karte-${k.nummer} [data-kuerzel="${f}"]`);
        await knopf.click();
        const rueck = await p.locator(`#karte-${k.nummer} .rueckmeldung`).innerText();
        const ok = (await knopf.isDisabled()) && (await knopf.innerText()).includes('✗') && rueck.includes(k.tipp) && rueck.includes('✗');
        H.pruefe(ok, `Karte ${k.nummer}: falsche Antwort ${f} → ✗, deaktiviert, Tipp sichtbar`);
        H.pruefe(!(await p.locator(`#karte-${k.nummer}`).evaluate((e) => e.classList.contains('ist-richtig'))), `Karte ${k.nummer}: Lösung nach ${f} nicht verraten`);
      }
      const r = p.locator(`#karte-${k.nummer} [data-kuerzel="${k.richtig}"]`);
      await r.click();
      const rueck = await p.locator(`#karte-${k.nummer} .rueckmeldung`).innerText();
      H.pruefe(rueck.includes('✓') && rueck.includes(k.erklaerung), `Karte ${k.nummer}: richtige Antwort → ✓ und Erklärung`);
      const alleAus = await p.$$eval(`#karte-${k.nummer} .antwort`, (b) => b.every((x) => x.disabled));
      H.pruefe(alleAus, `Karte ${k.nummer}: danach alle Knöpfe gesperrt`);
    }

    for (const { ab, nr } of reihen) {
      const box = `#reihe-${nr}`;
      const n = ab.schritte.length;
      const anzeigeReihe = await p.$$eval(`${box} .reihe-auswahl .schritt`, (b) => b.map((x) => Number(x.dataset.schritt)));
      H.pruefe(anzeigeReihe.length === n && JSON.stringify(anzeigeReihe) !== JSON.stringify([...Array(n).keys()]), `Reihenfolge: ${n} Schritte, gemischt angezeigt`, anzeigeReihe);
      for (let i = 0; i < n; i++) {
        // jeweils einen falschen Schritt antippen (solange es einen gibt)
        if (i < n - 1) {
          const falsch = p.locator(`${box} .reihe-auswahl [data-schritt="${i + 1}"]`);
          await falsch.click();
          const rueck = await p.locator(`${box} .rueckmeldung`).innerText();
          H.pruefe(rueck.includes(A.reiheFalsch) && rueck.includes(ab.schritte[i].tipp), `Schritt ${i + 1}: falscher Schritt → Tipp „${ab.schritte[i].tipp.slice(0, 30)}…“`);
          H.pruefe(await p.locator(`${box} .reihe-auswahl [data-schritt="${i + 1}"]`).isDisabled(), `Schritt ${i + 1}: falsch getippter Schritt vorerst gesperrt`);
          H.pruefe((await p.locator(`${box} li.gelegt`).count()) === i, `Schritt ${i + 1}: falscher Schritt wird nicht gelegt`);
        }
        await p.click(`${box} .reihe-auswahl [data-schritt="${i}"]`);
        H.pruefe((await p.locator(`${box} li.gelegt`).count()) === i + 1, `Schritt ${i + 1} richtig gelegt`);
      }
      const gelegt = await p.$$eval(`${box} li.gelegt .gelegt-text`, (l) => l.map((x) => x.textContent));
      H.pruefe(JSON.stringify(gelegt) === JSON.stringify(ab.schritte.map((s) => s.text)), 'Reihenfolge vollständig und korrekt angezeigt');
      H.pruefe(await p.locator(`${box} .reihe-auswahl`).isHidden(), 'Auswahl verschwindet nach dem letzten Schritt');
      H.pruefe((await p.locator(`${box} .rueckmeldung`).innerText()).includes(A.reiheFertig), 'Abschlussmeldung der Reihenfolge');
    }

    H.pruefe((await p.locator('#fortschritt-text').innerText()) === `${gesamt} von ${gesamt} gelöst`, 'Fortschritt am Ende vollständig');
    // Mit so vielen Fehlversuchen: kein Merksatz, sondern Durchklick-Warnung
    const warnung = p.locator('.durchklicken');
    H.pruefe(daten.mindestensErsterVersuch > 0 && (await warnung.count()) === 1 && !(await merksatzDa()), 'Zu viele Fehlversuche → Warnung statt Merksatz');

    // Neu laden: Stand bleibt erhalten
    await p.reload();
    H.pruefe((await p.locator('#fortschritt-text').innerText()) === `${gesamt} von ${gesamt} gelöst`, 'Nach Neuladen bleibt der Stand erhalten');

    await p.click('.durchklicken-knopf');
    H.pruefe((await p.locator('#fortschritt-text').innerText()) === `0 von ${gesamt} gelöst`, '„Aufgabe neu starten“ setzt alles zurück');
    H.pruefe((await p.locator('.karte.ist-richtig').count()) === 0, 'Keine Karte mehr als gelöst markiert');

    // ---------- Durchgang 2: alles beim ersten Versuch richtig ----------
    for (const { k } of karten) await p.click(`#karte-${k.nummer} [data-kuerzel="${k.richtig}"]`);
    for (const { ab, nr } of reihen) {
      for (let i = 0; i < ab.schritte.length; i++) await p.click(`#reihe-${nr} .reihe-auswahl [data-schritt="${i}"]`);
    }
    await p.waitForTimeout(300);
    H.pruefe(await merksatzDa(), 'Merksatz erscheint nach vollständiger Lösung');
    const ms = await p.locator('.merksatz').innerText();
    const kurz = (await p.evaluate(() => INHALTE.start.links)).find((l) => l.seite === seiteId).kurz;
    const hinweisText = (daten.merksatzHinweis || A.merksatzHinweis).replace('{kurz}', kurz);
    H.pruefe(ms.includes(hinweisText) && hinweisText.includes('Merksatz ' + kurz), `Hinweis „… Kasten Merksatz ${kurz}“ sichtbar`);
    const reihenfolge = await p.$$eval('.merksatz > *', (e) => e.map((x) => x.className || x.tagName));
    H.pruefe(reihenfolge.indexOf('merksatz-hinweis') !== -1 && reihenfolge.indexOf('merksatz-hinweis') < reihenfolge.indexOf('merksatz-text'), 'Hinweis steht über dem Merksatz', reihenfolge);
    const stil = await p.$eval('.merksatz-hinweis', (e) => { const c = getComputedStyle(e); return [parseFloat(c.fontSize), c.fontWeight, c.backgroundColor]; });
    H.pruefe(stil[0] >= 20 && Number(stil[1]) >= 700 && stil[2] !== 'rgba(0, 0, 0, 0)', 'Hinweis groß, fett und farbig hinterlegt', stil);
    H.pruefe(ms.includes(`Beim ersten Versuch richtig: ${gesamt} von ${gesamt}`), 'Erster-Versuch-Zähler stimmt');
    H.pruefe(!ms.includes('**'), 'Keine Sternchen im Merksatz');
    const fett = await p.$$eval('.merksatz .betont', (b) => b.length);
    H.pruefe(fett === (daten.merksatz.match(/\*\*/g) || []).length / 2, 'Fett markierte Wörter im Merksatz', fett);

    await p.screenshot({ path: `ergebnisse/${seiteId}_fertig.png`, fullPage: true });

    // Startseite zeigt den Haken
    const start = await handy.newPage();
    H.beobachten(start, protokoll, 'index');
    await start.goto(basis + 'index.html');
    H.pruefe(await start.locator(`#link-${seiteId}`).evaluate((a) => a.classList.contains('erledigt')), `Startseite: ${seiteId} als erledigt markiert`);
    await start.close();

    // „Noch einmal üben“
    await p.click('#noch-einmal');
    H.pruefe((await p.locator('#fortschritt-text').innerText()) === `0 von ${gesamt} gelöst` && !(await merksatzDa()), '„Noch einmal üben“ setzt zurück und blendet den Merksatz aus');
    await p.close();
  }

  // Startseite
  console.log('\n== index.html');
  const s = await handy.newPage();
  H.beobachten(s, protokoll, 'index');
  await s.goto(basis);
  const links = await s.$$eval('.startlink', (a) => a.map((x) => x.getAttribute('href')));
  H.pruefe(JSON.stringify(links) === JSON.stringify(['bremsen.html', 'phasen.html', 'angehoerige.html']), 'Startseite verlinkt alle drei Übungen', links);
  await s.screenshot({ path: 'ergebnisse/index.png', fullPage: true });

  console.log('\n== Allgemein');
  H.pruefe(protokoll.konsole.length === 0, 'Keine Fehler in der Konsole', protokoll.konsole);
  H.pruefe(protokoll.extern.length === 0, 'Keine Anfragen an fremde Adressen', protokoll.extern);

  await browser.close();
  server.close();
  process.exit(H.ergebnis() ? 0 : 1);
})();
