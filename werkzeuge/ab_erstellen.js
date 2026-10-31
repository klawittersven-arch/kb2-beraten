/* Erstellt das Arbeitsblatt (AFG) und die Lösung (LSG) als .docx.
   Aufruf (im Hauptverzeichnis): node werkzeuge/ab_erstellen.js
   Voraussetzung: npm install docx (einmalig) und die QR-Codes in qr/ (python werkzeuge/qr_erzeugen.py).
   Ergebnis: arbeitsblatt/04_Professionell_beraten_AFG.docx und …_LSG.docx */
'use strict';
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType, AlignmentType, VerticalAlign, TabStopType, Header, Footer,
  PageNumber, Tab, TableLayoutType, HeightRule
} = require('docx');

const AUS = process.argv[2] || path.resolve(__dirname, '..', 'arbeitsblatt');
const BILD = (n) => fs.readFileSync(path.join(__dirname, 'bilder', n));
const WURZEL = path.resolve(__dirname, '..');
const QR = (s) => fs.readFileSync(path.join(WURZEL, 'qr', `qr_${s}.png`));
const LINK = (s) => `klawittersven-arch.github.io/kb2-beraten/${s}.html`;

const PETROL_D = '25434B';
const PETROL = '3F6C72';
const HELL = 'EAF2F4';
const ROT = 'C00000';
const GRAU = '6B7B80';
const BREITE = 9906; // Satzspiegel A4 bei 1000 twips Rand links/rechts
const PX = (cm) => Math.round(cm * 37.795); // cm → Pixel (96 dpi) für ImageRun

const keinRand = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const ohneRaender = { top: keinRand, bottom: keinRand, left: keinRand, right: keinRand, insideHorizontal: keinRand, insideVertical: keinRand };
const duenn = { style: BorderStyle.SINGLE, size: 4, color: '7F8C8D' };
const rahmen = { top: duenn, bottom: duenn, left: duenn, right: duenn };
const linienRand = { style: BorderStyle.SINGLE, size: 4, color: '9AA7AA' };

function erstelle(lsg) {
  /* ---------- kleine Bausteine ---------- */
  const t = (text, o = {}) => new TextRun({ text, ...o });
  const b = (text, o = {}) => new TextRun({ text, bold: true, ...o });
  const rot = (text, o = {}) => new TextRun({ text, color: ROT, ...o });
  const p = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], spacing: { after: 60 }, ...o });
  const bild = (daten, wCm, hCm) => new ImageRun({ type: 'png', data: daten, transformation: { width: PX(wCm), height: PX(hCm) } });

  // Schreiblinien als Tabelle (jede Zeile hat ihren eigenen Strich – auch in Word und LibreOffice).
  // zeilen: [[nummer, loesungstext], …]; in der Lösung steht der rote Text auf der Linie.
  const linien = (zeilen) => new Table({
    width: { size: BREITE, type: WidthType.DXA }, columnWidths: [420, BREITE - 420], layout: TableLayoutType.FIXED,
    borders: ohneRaender,
    rows: zeilen.map(([nr, loesung]) => new TableRow({
      height: { value: 470, rule: HeightRule.EXACT },
      children: [
        new TableCell({ width: { size: 420, type: WidthType.DXA }, borders: { top: keinRand, left: keinRand, right: keinRand, bottom: keinRand }, verticalAlign: VerticalAlign.BOTTOM,
          children: [new Paragraph({ spacing: { after: 0 }, children: nr ? [b(nr, { color: PETROL_D })] : [] })] }),
        new TableCell({ width: { size: BREITE - 420, type: WidthType.DXA }, borders: { top: keinRand, left: keinRand, right: keinRand, bottom: linienRand }, verticalAlign: VerticalAlign.BOTTOM,
          children: [new Paragraph({ spacing: { after: 0 }, children: lsg && loesung ? [rot(loesung, { size: 20 })] : [] })] })
      ]
    }))
  });

  // Schreiblinien mit fettem Anfang (z. B. „Urteil:“); in der Lösung folgt der rote Text
  const linienMitText = (zeilen) => new Table({
    width: { size: BREITE, type: WidthType.DXA }, columnWidths: [BREITE], layout: TableLayoutType.FIXED,
    borders: ohneRaender,
    rows: zeilen.map(([anfang, loesung]) => new TableRow({
      height: { value: 470, rule: HeightRule.EXACT },
      children: [new TableCell({ width: { size: BREITE, type: WidthType.DXA }, borders: { top: keinRand, left: keinRand, right: keinRand, bottom: linienRand }, verticalAlign: VerticalAlign.BOTTOM,
        children: [new Paragraph({ spacing: { after: 0 }, children: [...(anfang ? [b(anfang + ' ', { color: PETROL_D })] : []), ...(lsg && loesung ? [rot(loesung, { size: 20 })] : [])] })] })]
    }))
  });

  // Teil-Überschrift als farbiger Balken
  const teil = (text, zeit) => new Paragraph({
    children: [b(text, { color: 'FFFFFF', size: 24 }), new TextRun({ children: [new Tab(), zeit], color: 'FFFFFF', size: 20 })],
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: PETROL_D },
    tabStops: [{ type: TabStopType.RIGHT, position: BREITE - 60 }],
    spacing: { before: 200, after: 80 },
    indent: { left: 60, right: 60 },
    keepNext: true
  });

  // Aufgabenkopf mit Symbol (Handy/Stift), Nummer, Titel und Zeit
  const aufgabe = (art, nr, titel, zeit) => new Paragraph({
    children: [
      bild(BILD(art === 'handy' ? 'icon_handy.png' : 'icon_stift.png'), 0.62, 0.62),
      b(`  ${nr} · ${titel}`, { color: PETROL_D, size: 23 }),
      new TextRun({ children: [new Tab(), (art === 'handy' ? 'Smartphone · ' : 'Papier · ') + zeit], color: GRAU, size: 19 })
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: BREITE }],
    spacing: { before: 140, after: 40 },
    keepNext: true
  });

  // Text links, QR-Code rechts
  const mitQR = (seite, absaetze) => new Table({
    width: { size: BREITE, type: WidthType.DXA },
    columnWidths: [BREITE - 1800, 1800],
    layout: TableLayoutType.FIXED,
    borders: ohneRaender,
    rows: [new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: BREITE - 1800, type: WidthType.DXA }, borders: ohneRaender, verticalAlign: VerticalAlign.CENTER,
          children: [...absaetze, p([t('Link: ', { size: 17, color: GRAU }), t(LINK(seite), { size: 17, color: GRAU })], { spacing: { before: 40, after: 0 } })]
        }),
        new TableCell({
          width: { size: 1800, type: WidthType.DXA }, borders: ohneRaender, verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [bild(QR(seite), 2.4, 2.4)] })]
        })
      ]
    })]
  });

  // Kasten (eine Zelle, Rand, hell hinterlegt)
  const kasten = (absaetze, fill = 'FFFFFF', randFarbe = PETROL) => {
    const r = { style: BorderStyle.SINGLE, size: 12, color: randFarbe };
    return new Table({
      width: { size: BREITE, type: WidthType.DXA }, columnWidths: [BREITE], layout: TableLayoutType.FIXED,
      rows: [new TableRow({ cantSplit: true, children: [new TableCell({
        width: { size: BREITE, type: WidthType.DXA },
        borders: { top: r, bottom: r, left: r, right: r },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: absaetze
      })] })]
    });
  };

  // Lücke im Merksatz: leer = Unterstrich, Lösung = rotes Wort
  const luecke = (wort, breite = 12) => lsg ? rot(wort, { bold: true, underline: {} }) : t('_'.repeat(breite));

  /* ---------- Kopf (wie Schulvorlage) ---------- */
  const zelle = (children, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: rahmen, margins: { left: 80, right: 80, top: 20, bottom: 20 }, verticalAlign: VerticalAlign.CENTER, children, ...o });
  const kt = (text, fett = false) => new Paragraph({ children: [new TextRun({ text, bold: fett, size: 18 })], spacing: { after: 0 } });
  const kopfTabelle = new Table({
    width: { size: BREITE, type: WidthType.DXA },
    columnWidths: [3000, 3453, 3453],
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ children: [
        zelle([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [bild(BILD('logo.png'), 4.6, 1.38)] })], 3000, { rowSpan: 3 }),
        zelle([kt('Name:')], 3453), zelle([kt('Datum:')], 3453)
      ] }),
      new TableRow({ children: [zelle([kt('Klasse | Fach | Lehrer*in: 3BFP2 | KB II | Lo / Kl')], 6906, { columnSpan: 2 })] }),
      new TableRow({ children: [zelle([kt('Themenblock I – Thema: Beratung · Gesprächsbremsen, Phasen, Angehörige', true)], 6906, { columnSpan: 2 })] })
    ]
  });

  /* ---------- Inhalt ---------- */
  const inhalt = [];

  inhalt.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 60, after: 80 },
    children: [b('Professionell beraten – Gesprächsbremsen, Beratungsphasen, Angehörige', { size: 28, color: PETROL_D }),
      ...(lsg ? [b('  [LSG]', { size: 28, color: ROT })] : [])]
  }));
  inhalt.push(p([b('Lernziel: '), t('Sie erkennen Gesprächsbremsen und beurteilen Aussagen von Pflegefachpersonen, nennen die sechs Phasen der Beratung und begründen, wie Angehörige professionell einbezogen werden.')], { spacing: { after: 40 } }));
  inhalt.push(p([
    bild(BILD('icon_handy.png'), 0.5, 0.5), t(' = am Smartphone (QR-Code scannen)      ', { size: 20 }),
    bild(BILD('icon_stift.png'), 0.5, 0.5), t(' = auf Papier', { size: 20 })
  ], { spacing: { after: 40 } }));

  const msAbsatz = (teile) => new Paragraph({ spacing: { before: 70, after: 70 }, children: teile });

  // ---------- Teil A: Gesprächsbremsen ----------
  inhalt.push(teil('Teil A · Gesprächsbremsen erkennen und beurteilen', '≈ 20 Min.'));
  inhalt.push(aufgabe('handy', 'A1', 'Gesprächsbremsen-Check', '7 Min.'));
  inhalt.push(mitQR('bremsen', [
    p([t('Scannen Sie den QR-Code und tragen Sie oben '), b('Vorname + Raumcode vom Beamer'), t(' ein. Lesen Sie die Infokarte und ordnen Sie Aussagen von Pflegekräften den passenden Gesprächsbremsen zu.')]),
    p([b('Am Ende: '), t('Ergänzen Sie den Merksatz.')])
  ]));
  inhalt.push(kasten([
    p(b('Merksatz A1', { color: PETROL_D }), { spacing: { after: 0 } }),
    msAbsatz([t('Gesprächsbremsen wie Ratschläge, Befehle, Drohungen, '), luecke('Bagatellisieren', 16), t(' und '), luecke('Belehren', 14),
      t(' machen aus einer Beratung eine '), luecke('Belehrung', 14), t('. Sie ist dann weder '), luecke('ergebnisoffen', 16), t(' noch '), luecke('partizipativ', 16), t('.')])
  ]));

  inhalt.push(aufgabe('stift', 'A2', 'Eine Aussage beurteilen', '12 Min.'));
  inhalt.push(kasten([
    p([t('Lina hat Frau Schneider gezeigt, wie sie den Insulinpen vorbereitet. Frau Schneider sagt: '), t('„Ich habe Angst, dass ich mich bei der Dosis vertue.“', { italics: true }),
      t(' Eine Kollegin kommt herein und sagt: '),
      t('„Ach was, das ist doch kinderleicht! Sie drehen einfach auf 16 und drücken ab. Dass man den Pen vorher schwenkt, hat Ihnen doch schon jeder dreimal erklärt. Wenn Sie das nicht hinbekommen, muss eben weiter jeden Tag der Pflegedienst kommen.“', { italics: true }),
      t(' Frau Schneider legt den Pen weg und sagt leise: '), t('„Dann lassen wir das eben.“', { italics: true })], { spacing: { after: 0 } })
  ], HELL));
  inhalt.push(p([t('Beurteilen Sie die Aussage der Kollegin im Hinblick auf eine professionelle Beratung. Gehen Sie so vor: '),
    b('Zitat → Gesprächsbremse → warum hinderlich? → Wirkung → Urteil.')], { spacing: { before: 80, after: 60 } }));

  // Beurteilungstabelle: drei Zeilen zum Ausfüllen
  const bw = [3300, 2000, 4606];
  const bz = (children, w, fill) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: rahmen, margins: { left: 80, right: 80, top: 40, bottom: 40 }, verticalAlign: VerticalAlign.CENTER, shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined, children });
  const bp = (text, o = {}) => new Paragraph({ spacing: { after: 0 }, children: text ? [lsg && o.rot !== false ? rot(text, { size: 19 }) : t(text, { size: 19, bold: !!o.fett })] : [] });
  const beurteilung = [
    ['„Ach was, das ist doch kinderleicht!“', 'bagatellisieren', 'Ihre Angst wird heruntergespielt – sie fühlt sich nicht ernst genommen.'],
    ['„Sie drehen einfach auf 16 und drücken ab.“', 'Ratschlag geben / befehlen', 'Die Lösung wird vorgegeben – nicht ergebnisoffen, nicht partizipativ.'],
    ['„… hat Ihnen doch schon jeder dreimal erklärt.“', 'belehren (Vorwurf)', 'Beschämt sie, statt ihr zu helfen; sie traut sich weniger zu.']
  ];
  inhalt.push(new Table({
    width: { size: BREITE, type: WidthType.DXA }, columnWidths: bw, layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ tableHeader: true, children: [bz([bp('Zitat', { fett: true, rot: false })], bw[0], HELL), bz([bp('Gesprächsbremse', { fett: true, rot: false })], bw[1], HELL), bz([bp('Warum hinderlich?', { fett: true, rot: false })], bw[2], HELL)] }),
      ...beurteilung.map((z) => new TableRow({ height: { value: 820, rule: HeightRule.ATLEAST }, cantSplit: true, children: z.map((text, i) => bz([bp(lsg ? text : '')], bw[i])) }))
    ]
  }));
  if (lsg) inhalt.push(p(rot('Ebenfalls richtig: „Wenn Sie das nicht hinbekommen, muss eben … der Pflegedienst kommen.“ – drohen: macht Druck und Angst.', { size: 19, italics: true }), { spacing: { before: 40, after: 0 } }));
  inhalt.push(linienMitText([
    ['Wirkung auf Frau Schneider:', 'Sie legt den Pen weg und gibt auf – Rückzug, ihre Motivation sinkt.'],
    ['', ''],
    ['Urteil:', 'Keine professionelle Beratung, sondern eine Belehrung.'],
    ['', '']
  ]));

  // ---------- Teil B: 6 Phasen ----------
  inhalt.push(teil('Teil B · Die 6 Phasen der Beratung', '≈ 8 Min.'));
  inhalt.push(aufgabe('handy', 'B1', 'Die 6 Phasen der Beratung', '5 Min.'));
  inhalt.push(mitQR('phasen', [
    p(t('Scannen Sie den QR-Code. Bringen Sie die sechs Phasen in die richtige Reihenfolge und ordnen Sie Sätze aus einem Beratungsgespräch den Phasen zu.')),
    p([b('Am Ende: '), t('Ergänzen Sie den Merksatz.')])
  ]));
  inhalt.push(kasten([
    p(b('Merksatz B1', { color: PETROL_D }), { spacing: { after: 0 } }),
    msAbsatz([t('In Phase 2 erfasse ich den Beratungsbedarf: Ich frage nach der '), luecke('Sicht', 12), t(' der Person, höre zu und ordne meine '), luecke('Beobachtungen', 16),
      t(' ein. Der Bedarf kann '), luecke('selbst geäußert', 16), t(' oder '), luecke('pflegefachlich erkannt', 20), t(' sein.')])
  ]));
  inhalt.push(aufgabe('stift', 'B2', 'Die 6 Phasen aus dem Gedächtnis', '3 Min.'));
  inhalt.push(p(t('Nennen Sie die sechs Phasen des Beratungsprozesses in der richtigen Reihenfolge – ohne nachzuschauen.')));
  // zweispaltig: 1–3 links, 4–6 rechts
  const halb = (BREITE - 2 * 420 - 300) / 2;
  const sp = [420, halb, 300, 420, halb];
  const lz = (text, mitLinie) => new TableCell({ width: { size: 0, type: WidthType.AUTO }, borders: { top: keinRand, left: keinRand, right: keinRand, bottom: mitLinie ? linienRand : keinRand }, verticalAlign: VerticalAlign.BOTTOM,
    children: [new Paragraph({ spacing: { after: 0 }, children: text ? [text] : [] })] });
  const phasen = ['Beziehung herstellen', 'Beratungsbedürfnisse/-bedarfe erfassen', 'Beratungsziele aushandeln', 'Lösungen entwickeln', 'Beratungsprozess reflektieren', 'Beratung beenden'];
  inhalt.push(new Table({
    width: { size: BREITE, type: WidthType.DXA }, columnWidths: sp, layout: TableLayoutType.FIXED, borders: ohneRaender,
    rows: [0, 1, 2].map((i) => new TableRow({
      height: { value: 470, rule: HeightRule.EXACT },
      children: [
        lz(b(String(i + 1), { color: PETROL_D }), false), lz(lsg ? rot(phasen[i], { size: 20 }) : null, true), lz(null, false),
        lz(b(String(i + 4), { color: PETROL_D }), false), lz(lsg ? rot(phasen[i + 3], { size: 20 }) : null, true)
      ]
    }))
  }));

  // ---------- Teil C: Angehörige ----------
  inhalt.push(teil('Teil C · Angehörige einbeziehen', '≈ 8 Min.'));
  inhalt.push(aufgabe('handy', 'C1', 'Angehörige einbeziehen', '4 Min.'));
  inhalt.push(mitQR('angehoerige', [
    p(t('Scannen Sie den QR-Code. Entscheiden Sie, wie Lina die Tochter von Frau Schneider und die Ehefrau von Herrn Meier professionell einbezieht.')),
    p([b('Am Ende: '), t('Ergänzen Sie den Merksatz.')])
  ]));
  inhalt.push(kasten([
    p(b('Merksatz C1', { color: PETROL_D }), { spacing: { after: 0 } }),
    msAbsatz([t('Angehörige beziehe ich nur mit '), luecke('Einverständnis', 16), t(' ein (Schweigepflicht). Ich spreche '), luecke('mit', 8),
      t(' der Person, nicht über ihren Kopf hinweg. Die '), luecke('Entscheidung', 16), t(' bleibt bei ihr.')])
  ]));
  inhalt.push(aufgabe('stift', 'C2', 'Regeln begründen', '4 Min.'));
  inhalt.push(p([t('Die Tochter von Frau Schneider ruft an: '), t('„Sagen Sie mir bitte genau, wie Mamas Werte sind. Und sagen Sie ihr, dass sie keinen Kuchen mehr essen darf – auf mich hört sie ja nicht.“', { italics: true }),
    t(' Begründen Sie zwei Regeln, wie Lina die Tochter professionell einbezieht: '), b('„Regel – weil …“')]));
  inhalt.push(linien([
    ['1', 'Lina gibt nur mit Einverständnis von Frau Schneider Auskunft, weil die Schweigepflicht'],
    ['', 'auch gegenüber Angehörigen gilt.'],
    ['2', 'Lina bespricht den Kuchen mit Frau Schneider selbst; sie entscheidet, weil sie ein Recht auf'],
    ['', 'Selbstbestimmung (Autonomie) hat. (Auch richtig: Sorge der Tochter ernst nehmen, keine Partei ergreifen.)']
  ]));

  // ---------- Hinweise für die Lehrkraft (nur LSG) ----------
  if (lsg) {
    inhalt.push(new Paragraph({ pageBreakBefore: true, children: [b('Hinweise für die Lehrkraft', { size: 26, color: PETROL_D })], spacing: { after: 80 } }));
    const hw = [2700, 7206];
    const zelleH = (children, w, fill) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: rahmen, margins: { left: 80, right: 80, top: 30, bottom: 30 }, verticalAlign: VerticalAlign.CENTER, shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined, children });
    const hz = (a, c, fill) => new TableRow({ cantSplit: true, children: [zelleH([p(a, { spacing: { after: 0 } })], hw[0], fill), zelleH([p(c, { spacing: { after: 0 } })], hw[1], fill)] });
    inhalt.push(new Table({
      width: { size: BREITE, type: WidthType.DXA }, columnWidths: hw, layout: TableLayoutType.FIXED,
      rows: [
        hz(b('Aufgabe / Zeit'), b('Bezug zur Klassenarbeit (KB 2, v4) und Begründung Papier/Smartphone'), HELL),
        hz(t('A1 Handy · A2 Papier (≈ 20 Min.)'), t('Aufgabe 3 (Aussage beurteilen; EH: bagatellisieren, Ratschlag, Fachsprache, belehren, Wirkung, Urteil „Belehrung“). Die Begriffe der Gesprächsbremsen und der Aufbau einer Beurteilung kamen in den bisherigen AB nicht vor (EH verweist auf „Die Grenzen pflegerischer Beratung“). A1 am Handy: erkennen und zuordnen mit Sofort-Rückmeldung. A2 auf Papier, weil die Klausur eine schriftliche Beurteilung (AFB III) verlangt.')),
        hz(t('B1 Handy · B2 Papier (≈ 8 Min.)'), t('Aufgabe 5 (sechs Phasen in richtiger Reihenfolge + Phase 2 fallbezogen). Inhaltlich durch „6 Phasen“, „Planung“ und „Anwendung“ abgedeckt; B1/B2 sichern das Abrufen der Phasennamen und die zwei Arten von Beratungsbedarf.')),
        hz(t('C1 Handy · C2 Papier (≈ 8 Min.)'), t('EH 8 (Einbeziehen von Bezugspersonen) – in der Klassenarbeit v4 derzeit nicht enthalten. Regeln: Einverständnis/Schweigepflicht, gemeinsam statt über den Kopf hinweg, Entscheidung bleibt beim Patienten, keine Partei ergreifen, Belastung der Angehörigen wahrnehmen.')),
        hz(t('Nicht enthalten'), t('Aufgabe 1 (Wittener Werkzeuge), Aufgabe 2 (hinderliche Faktoren) und Aufgabe 4 (Beratungsansatz) – bereits mit „Die Wittener Werkzeuge“, „Informieren, anleiten, schulen oder beraten?“ und „Beratungsansätze anwenden“ abgedeckt. Die Fälle auf diesem AB weichen bewusst vom Klausurfall ab.')),
        hz(t('Zeitpuffer'), t('Das AB dauert ca. 35–40 Min. Wer nicht fertig wird, beendet die QR-Übungen zu Hause.')),
        hz(t('Material'), t('Handys mit Kamera (sonst Tandems oder den Link abtippen). Die Übungen funktionieren nach dem ersten Laden auch bei schlechtem WLAN. Gespeichert wird nur für die Beamer-Anzeige (Vorname + Stand, bei Cloudflare, Löschung nach 6 Std.); wer „Ohne Anzeige weiter“ wählt, sendet nichts.')),
        hz(t('Schutz gegen Durchklicken'), t('Den Merksatz gibt es nur, wenn genug Aufgaben beim ersten Versuch richtig sind (A1: 9 von 14, B1: 9 von 14, C1: 4 von 6); sonst muss die Übung neu gestartet werden.')),
        hz(t('Fortschritt am Beamer'), t('klawittersven-arch.github.io/kb2-beraten/fortschritt.html öffnen → „Neuen Raum starten“ → Raumcode zeigen. Angezeigt wird je Person „x von y gelöst“ für A1, B1 und C1 (Haken = Merksatz erreicht, Warndreieck = zu viel geraten). Nutzt denselben Cloudflare-Dienst wie die KB1-App. Probeansicht: …/fortschritt.html?demo=1')),
        hz(t('Texte ändern'), t('Alle Texte der App stehen in docs/inhalte.js im Repository kb2-beraten (auf GitHub mit dem Stift bearbeiten, „Commit changes“; nach 1–2 Min. online).'))
      ]
    }));
  }

  return new Document({
    creator: 'S. Klawitter',
    title: lsg ? 'KB II Professionell beraten – Lösung' : 'KB II Professionell beraten – Arbeitsblatt',
    styles: { default: { document: { run: { font: 'Calibri', size: 21 }, paragraph: { spacing: { line: 264, lineRule: 'auto' } } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1950, right: 1000, bottom: 850, left: 1000, header: 420, footer: 380 } } },
      headers: { default: new Header({ children: [kopfTabelle] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'KB II · Professionell beraten' + (lsg ? ' · Lösung' : '') + ' · Seite ', size: 16, color: GRAU }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAU }),
        new TextRun({ text: ' von ', size: 16, color: GRAU }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAU })
      ] })] }) },
      children: inhalt
    }]
  });
}

(async () => {
  fs.mkdirSync(AUS, { recursive: true });
  for (const [lsg, name] of [[false, '04_Professionell_beraten_AFG.docx'], [true, '04_Professionell_beraten_LSG.docx']]) {
    const buf = await Packer.toBuffer(erstelle(lsg));
    fs.writeFileSync(path.join(AUS, name), buf);
    console.log('geschrieben:', name, buf.length, 'Bytes');
  }
})();
