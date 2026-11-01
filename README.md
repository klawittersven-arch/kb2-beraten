# KB II – Beratung · Professionell beraten (3BFP2)

Arbeitsblatt 04 mit drei kleinen Smartphone-Übungen: Gesprächsbremsen, die 6 Phasen der Beratung
und das Einbeziehen von Angehörigen (generalistische Pflegeausbildung, 2. Ausbildungsjahr, KB II).

| Teil | Aufgabe | Wo? | Inhalt |
|---|---|---|---|
| A | A1 Gesprächsbremsen-Check | 📱 `bremsen.html` | 8 Gesprächsbremsen erkennen (Ratschläge, befehlen, drohen, bagatellisieren, belehren, unterbrechen, Thema wechseln, Fachsprache), Wirkung und Urteil |
| A | A2 Eine Aussage beurteilen | ✍️ Papier | Zitat → Gesprächsbremse → warum hinderlich → Wirkung → Urteil |
| B | B1 Die 6 Phasen | 📱 `phasen.html` | Reihenfolge, Sätze den Phasen zuordnen, selbst geäußerter / pflegefachlich erkannter Bedarf |
| B | B2 Die 6 Phasen aus dem Gedächtnis | ✍️ Papier | Phasen in der richtigen Reihenfolge aufschreiben |
| C | C1 Angehörige einbeziehen | 📱 `angehoerige.html` | Einverständnis/Schweigepflicht, gemeinsam statt über den Kopf hinweg, Autonomie, keine Partei ergreifen |
| C | C2 Regeln begründen | ✍️ Papier | zwei Regeln mit „…, weil …“ |

Faustregel: **Papier**, wo frei geschrieben werden muss (nennen, beurteilen, begründen);
**Smartphone**, wo zugeordnet, sortiert oder entschieden wird. Jede Smartphone-Übung endet mit einem
Merksatz, den die SuS als Lückentext auf dem AB ergänzen.

Die Technik ist dieselbe wie in der KB1-App (Repository `kb1-diabetes`).

## Dateien

```
arbeitsblatt/        ← 04_Professionell_beraten_AFG (Arbeitsblatt) und _LSG (Lösung mit Lehrkraft-Hinweisen), je .docx und .pdf
docs/                ← alles, was GitHub Pages veröffentlicht (die Web-App)
  inhalte.js         ← ALLE Texte (Übungen, Anmeldung am Handy, Beamer-Seite)
  config.js          ← Einstellungen der Fortschrittsanzeige (Worker-Adresse, Sperrwörter …)
  index.html, bremsen.html, phasen.html, angehoerige.html
  fortschritt.html   ← Fortschritt am Beamer (für die Lehrkraft, nirgends verlinkt)
  app.js, melden.js, fortschritt.js, gemeinsam.js   ← Programmlogik
  style.css, fortschritt.css, sw.js                 ← Gestaltung, Offline-Speicher
qr/                  ← QR-Codes (PNG) für die drei Übungen
werkzeuge/
  qr_erzeugen.py     ← erzeugt und prüft die QR-Codes
  ab_erstellen.js    ← erzeugt Arbeitsblatt und Lösung als .docx (Bilder in werkzeuge/bilder/)
tests/               ← automatische Tests (Playwright), Ergebnisse in tests/ergebnisse/
```

## GitHub Pages einschalten (einmalig, ca. 2 Minuten)

1. Auf GitHub im Repository oben **Settings** öffnen → links **Pages**.
2. Bei „Build and deployment“ → Source: **Deploy from a branch**.
3. Branch: **main**, Ordner: **/docs** → **Save**.
4. Nach etwa 1–5 Minuten sind die Seiten erreichbar:
   - https://klawittersven-arch.github.io/kb2-beraten/bremsen.html
   - https://klawittersven-arch.github.io/kb2-beraten/phasen.html
   - https://klawittersven-arch.github.io/kb2-beraten/angehoerige.html
   - https://klawittersven-arch.github.io/kb2-beraten/ (Startseite)

Die QR-Codes im Arbeitsblatt zeigen bereits auf diese Adressen.

## Fortschritt am Beamer

`https://klawittersven-arch.github.io/kb2-beraten/fortschritt.html` öffnen → **„Neuen Raum starten“** →
Raumcode zeigen. Die SuS geben oben in der Übung Vorname + Raumcode ein; angezeigt wird je Person
„x von y gelöst“ für A1, B1 und C1 (✓ = Merksatz erreicht, ⚠ = zu viel geraten). **Namen verbergen**,
**Vollbild**, Eintrag entfernen (Klick), **Liste leeren**, **Neuer Raum**. Probeansicht ohne Netz:
`…/fortschritt.html?demo=1`.

**Anweisung A1 + A2** bzw. **Anweisung B1 + B2 + C1 + C2** (unten, gelb umrandet) blendet groß über den
Karten ein: „Bearbeiten Sie jetzt die Aufgaben A1 und A2!“ bzw. „… B1, B2, C1 und C2!“. Der Fortschritt
bleibt darunter sichtbar (die Karten werden passend verkleinert). Noch ein Klick auf denselben Knopf
blendet die Anweisung wieder aus; ein Neuladen der Seite übersteht sie. Texte und Knöpfe stehen in
`docs/inhalte.js` → `beamer.anweisungen`.

Es wird **derselbe Cloudflare-Dienst** wie für die KB1-App genutzt
(`https://kb1-diabetes.klawittersven.workers.dev`, eingetragen in `docs/config.js`). Eine eigene
Einrichtung ist nicht nötig – der Dienst muss nur einmal für `kb1-diabetes` eingerichtet sein (siehe
README dort). Räume sind voneinander getrennt; KB1 und KB2 können gleichzeitig laufen.

Datenschutz: Übertragen werden nur Raumcode, Zufalls-Geräte-ID, Vorname und je Übung „x von y gelöst“.
Lesen kann nur der Browser der Lehrkraft (geheimer Raumschlüssel); nach 6 Stunden löscht Cloudflare
den Raum automatisch. Wer „Ohne Anzeige weiter“ wählt, sendet nichts. Keine Cookies, keine Analyse,
keine fremden Schriften oder Skripte. Die Seiten funktionieren nach dem ersten Aufruf auch offline.

## Texte ändern (`docs/inhalte.js`)

Auf GitHub die Datei öffnen → Stift („Edit this file“) → nur den Text **zwischen den einfachen
Hochkommas** `' … '` ändern → „Commit changes“. Nach 1–2 Minuten ist die Änderung online.
`**Wort**` wird fett, `\n` beginnt eine neue Zeile. Wenn Sie einen Merksatz ändern, passen Sie auch den
Lückentext auf dem Arbeitsblatt an (fett = die Wörter für die Lücken).

**Schutz gegen Durchklicken:** `mindestensErsterVersuch` (A1: 9 von 14, B1: 9 von 14, C1: 4 von 6).
Sind weniger Aufgaben beim ersten Versuch richtig, gibt es keinen Merksatz, sondern „Aufgabe neu
starten“. Mit `0` schalten Sie die Prüfung ab.

Nach größeren Änderungen in `docs/sw.js` `var VERSION = 'v1';` erhöhen (Offline-Speicher erneuern).

## QR-Codes und Arbeitsblatt neu erzeugen

```
pip install segno zxing-cpp pillow
python werkzeuge/qr_erzeugen.py
npm install docx
node werkzeuge/ab_erstellen.js
soffice --headless --convert-to pdf --outdir arbeitsblatt arbeitsblatt/*.docx
```

## Tests

```
cd tests
npm install            # installiert Playwright
npx playwright install chromium
node uebungen.test.js            # alle drei Übungen in Handygröße 390 × 844
node offline_datenschutz.test.js # Offline, externe Adressen, Cookies, Dateigrößen
node fortschritt.test.js         # Beamer + mehrere Handys; braucht das Repository kb1-diabetes
                                 # daneben (oder KB1_REPO=Pfad) mit „npm install“ im Ordner worker/
node anweisung.test.js           # Beamer: Anweisung ein-/ausblenden, Karten lesbar (Probeansicht)
```
