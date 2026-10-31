/* ==========================================================================
   INHALTE – KB II Beratung: Gesprächsbremsen, Beratungsphasen, Angehörige (3BFP2)
   ==========================================================================

   In dieser Datei stehen ALLE Texte der drei Übungen (bremsen, phasen, angehoerige).
   Sie können die Texte hier ändern, ohne etwas vom Programm zu verstehen.

   So ändern Sie einen Text sicher:
   - Ändern Sie nur, was ZWISCHEN den einfachen Hochkommas ' … ' steht.
   - Die Hochkommas selbst, die Kommas am Zeilenende und die Klammern
     { } [ ] müssen stehen bleiben.
   - Deutsche Anführungszeichen „ … “ dürfen Sie im Text frei verwenden.
     Ein einfaches Hochkomma (') im Text müssen Sie als \' schreiben.
   - **Wort** wird fett gedruckt, \n beginnt eine neue Zeile.
   - Nach dem Speichern die Seite im Browser neu laden und kurz prüfen.

   Aufbau einer Karte:
     nummer      – die Nummer auf der Karte (fortlaufend über alle Teile)
     text        – Frage bzw. Aussage
     richtig     – Kürzel der richtigen Antwort, z. B. 'W'
     erklaerung  – erscheint nach der richtigen Antwort
     tipp        – erscheint nach einer falschen Antwort
                   (die richtige Lösung wird nie direkt verraten)
     antworten   – (nur wenn nötig) eigene Antwortknöpfe nur für diese Karte;
                   sonst gelten die Antworten des Teils

   Reihenfolge-Aufgabe (art: 'reihenfolge'):
     schritte    – in der RICHTIGEN Reihenfolge eintragen; das Programm mischt
                   sie für die Anzeige. tipp = Hinweis, wenn statt dieses
                   Schritts ein falscher angetippt wird.
   ========================================================================== */

var INHALTE = {

  /* ------------------------------------------------------------------------
     Texte, die auf allen Seiten gleich sind
     ------------------------------------------------------------------------ */
  allgemein: {
    kopfzeile: 'KB II – Beratung · 3BFP2',
    merksatzUeberschrift: 'Ihr Merksatz',
    // erscheint gut sichtbar über dem Merksatz; {kurz} = A1, B1 bzw. C1 (aus start.links)
    merksatzHinweis: 'Jetzt aufs Arbeitsblatt: Ergänzen Sie mit diesem Merksatz die Lücken im Kasten „Merksatz {kurz}“!',
    // {x} und {y} werden automatisch durch Zahlen ersetzt.
    fortschritt: '{x} von {y} gelöst',
    ersterVersuch: 'Beim ersten Versuch richtig: {x} von {y}',
    nochEinmal: 'Noch einmal üben',
    richtigText: 'Richtig!',
    falschText: 'Noch nicht richtig – versuchen Sie es noch einmal.',
    tippVorwort: 'Tipp:',
    infoHinweis: 'Tippen Sie auf eine Infokarte, um sie zu öffnen.',
    reiheGelegt: 'Ihre Reihenfolge:',
    reiheNochLeer: '(noch leer – tippen Sie unten den ersten Schritt an)',
    reiheAuswahl: 'Tippen Sie den nächsten Schritt an:',
    reiheFalsch: 'Das ist noch nicht der nächste Schritt.',
    reiheFertig: 'Richtig! Die Reihenfolge stimmt.',
    // Erscheint statt des Merksatzes, wenn zu wenige Aufgaben beim ersten Versuch richtig waren.
    // {x} = beim ersten Versuch richtig, {y} = Anzahl, {z} = nötige Mindestzahl
    durchklickenTitel: 'Hey, nicht einfach durchklicken!',
    durchklickenText: 'Beim ersten Versuch richtig: {x} von {y} – nötig sind mindestens {z}. Lesen Sie jede Aufgabe genau und überlegen Sie, bevor Sie tippen. Dann erhalten Sie auch Ihren Merksatz.',
    durchklickenKnopf: 'Aufgabe neu starten',
    zurUebersicht: 'Zur Übersicht'
  },

  /* ------------------------------------------------------------------------
     STARTSEITE (index.html)
     ------------------------------------------------------------------------ */
  start: {
    titel: 'Professionell beraten – Übungen',
    einleitung: 'Scannen Sie den QR-Code bei der Aufgabe auf Ihrem Arbeitsblatt – oder wählen Sie hier die Übung aus.',
    // kurz = Spaltenbeschriftung auf der Beamer-Seite (fortschritt.html),
    // gesamt = nur für die Probeansicht der Beamer-Seite (?demo=1)
    links: [
      { seite: 'bremsen', kurz: 'A1', gesamt: 14, text: 'A1 · Gesprächsbremsen-Check' },
      { seite: 'phasen', kurz: 'B1', gesamt: 14, text: 'B1 · Die 6 Phasen der Beratung' },
      { seite: 'angehoerige', kurz: 'C1', gesamt: 6, text: 'C1 · Angehörige einbeziehen' }
    ]
  },

  /* ------------------------------------------------------------------------
     FORTSCHRITT AM BEAMER – Anmeldung auf dem Handy (oben in jeder Übung)
     {name} und {raum} werden automatisch ersetzt.
     ------------------------------------------------------------------------ */
  melden: {
    titel: '📺 Fortschritt am Beamer',
    text: 'Geben Sie Ihren Vornamen und den Raumcode vom Beamer ein. Dann sieht Ihre Lehrkraft, wie weit Sie sind – nur „x von y gelöst“, keine einzelnen Antworten.',
    nameLabel: 'Vorname',
    raumLabel: 'Raumcode (4 Ziffern, steht am Beamer)',
    mitmachen: 'Mitmachen',
    ohne: 'Ohne Anzeige weiter',
    dochMitmachen: '📺 Beim Beamer-Fortschritt mitmachen',
    angemeldet: 'Angemeldet als {name} · Raum {raum}',
    aendern: 'ändern',
    gesendet: '✓ Stand übertragen',
    sendet: 'Stand wird übertragen …',
    offline: 'Gerade keine Verbindung – der Stand wird nachgereicht.',
    fehlerNameLaenge: 'Bitte geben Sie Ihren Vornamen ein (2 bis 20 Zeichen).',
    fehlerNameZeichen: 'Bitte nur Buchstaben, Ziffern, Leerzeichen und Bindestrich verwenden.',
    fehlerNameWort: 'Bitte wählen Sie einen anderen Namen.',
    fehlerRaum: 'Der Raumcode hat genau 4 Ziffern.',
    fehlerUnbekannt: 'Diesen Raumcode gibt es nicht (mehr). Bitte schauen Sie am Beamer nach.',
    fehlerVoll: 'Der Raum ist voll. Bitte sagen Sie Ihrer Lehrkraft Bescheid.',
    fehlerEntfernt: 'Ihr Eintrag wurde von der Lehrkraft entfernt. Sie können sich neu anmelden.'
  },

  /* ------------------------------------------------------------------------
     FORTSCHRITT AM BEAMER – Seite für die Lehrkraft (fortschritt.html)
     ------------------------------------------------------------------------ */
  beamer: {
    titel: 'Fortschritt · Professionell beraten',
    startTitel: 'Fortschritt am Beamer',
    startText: 'Starten Sie einen Raum und zeigen Sie den Raumcode. Die Schülerinnen und Schüler geben in der Übung ihren Vornamen und den Code ein. Angezeigt wird nur „x von y gelöst“ je Übung – keine einzelnen Antworten. Nach 6 Stunden wird alles automatisch gelöscht.',
    starten: 'Neuen Raum starten',
    nichtEingerichtet: 'Die Fortschrittsanzeige ist noch nicht eingerichtet: In docs/config.js fehlt FORTSCHRITT_URL. Siehe README, Abschnitt „Fortschritt am Beamer“.',
    startFehler: 'Der Raum konnte nicht gestartet werden. Bitte prüfen Sie die Internetverbindung und versuchen Sie es noch einmal.',
    raumcode: 'Raumcode',
    raumHinweis: 'In der Übung: Vorname + Raumcode',
    warten: 'Warten auf die ersten Anmeldungen …',
    angemeldet: '{n} angemeldet',
    fertigZahl: '{kurz} fertig: {x}',
    legendeFertig: '✓ Merksatz erreicht',
    legendeDurch: '⚠ zu viel geraten',
    aktualisiert: 'aktualisiert {uhr} Uhr',
    getrennt: 'keine Verbindung – neuer Versuch läuft …',
    namenVerbergen: 'Namen verbergen',
    namenZeigen: 'Namen zeigen',
    person: 'Person {n}',
    vollbild: 'Vollbild',
    vollbildAus: 'Vollbild beenden',
    leeren: 'Liste leeren',
    leerenFrage: 'Alle Einträge entfernen? Handys, die weiterarbeiten, erscheinen beim nächsten gelösten Schritt wieder.',
    neuerRaum: 'Neuer Raum',
    neuerRaumFrage: 'Neuen Raum starten? Alle müssen dann den neuen Code eingeben.',
    entfernenFrage: '„{name}“ entfernen? Das Handy kann sich danach neu anmelden.',
    entfernen: 'Entfernen',
    abbrechen: 'Abbrechen',
    ja: 'Ja',
    abgelaufen: 'Der Raum ist abgelaufen. Bitte starten Sie einen neuen Raum.',
    demo: 'Probeansicht mit erfundenen Namen'
  },

  /* ------------------------------------------------------------------------
     A1 – GESPRÄCHSBREMSEN-CHECK (Seite bremsen.html)
     ------------------------------------------------------------------------ */
  bremsen: {
    titel: 'A1 · Gesprächsbremsen-Check',
    anweisung: 'Manche Sätze bremsen ein Beratungsgespräch aus. Lesen Sie die Infokarte und lösen Sie dann die Aufgaben – bei jedem Fehler bekommen Sie einen Tipp.',

    infokarten: [
      {
        titel: '🛑 Gesprächsbremsen – woran erkenne ich sie?',
        offen: true,
        text: 'Gesprächsbremsen verhindern, dass die Person ihre Sicht einbringt:',
        punkte: [
          '**Ratschläge geben:** „Ich rate Ihnen …“, „Machen Sie doch einfach …“ → die Lösung wird vorgegeben.',
          '**Befehlen:** „Sie müssen …“, „Ab sofort …“ → Druck statt Beteiligung.',
          '**Drohen:** „Sonst …“, „Wenn Sie so weitermachen …“ → macht Angst und weckt Widerstand.',
          '**Bagatellisieren:** „Das ist doch kein Problem“, „Das bekommen Sie schon hin“ → Sorgen werden heruntergespielt.',
          '**Belehren / Moralisieren:** „Das haben wir doch schon hundertmal besprochen“, „Das sollte man eigentlich wissen“ → wirkt wie ein Vorwurf und beschämt.',
          '**Unterbrechen:** der Person ins Wort fallen → ihr Anliegen kommt nicht zur Sprache.',
          '**Thema wechseln:** auf Wichtiges nicht eingehen → die Person fühlt sich übergangen.',
          '**Unnötige Fachsprache:** „HbA1c“, „Hypoglykämie“ → wird oft nicht verstanden.'
        ],
        merke: 'Gesprächsbremsen machen aus einer Beratung eine Belehrung – nicht ergebnisoffen, nicht partizipativ.'
      }
    ],

    mindestensErsterVersuch: 9,

    abschnitte: [
      {
        ueberschrift: 'Teil 1 · Welche Gesprächsbremse steckt drin? (1)',
        anweisung: 'Ordnen Sie jede Aussage einer Pflegekraft zu.',
        antworten: [
          { kuerzel: 'R', text: 'Ratschlag geben' },
          { kuerzel: 'BE', text: 'befehlen' },
          { kuerzel: 'D', text: 'drohen' },
          { kuerzel: 'BA', text: 'bagatellisieren' }
        ],
        karten: [
          {
            nummer: 1,
            text: '„Ich rate Ihnen, jeden Abend eine Runde um den Block zu gehen.“',
            richtig: 'R',
            erklaerung: 'Die Pflegekraft gibt eine fertige Lösung vor – die Person wird nicht gefragt, was für sie passt.',
            tipp: 'Achten Sie auf die Worte „Ich rate Ihnen …“.'
          },
          {
            nummer: 2,
            text: '„Ab morgen messen Sie dreimal täglich Ihren Blutzucker. Verstanden?“',
            richtig: 'BE',
            erklaerung: 'Eine Anweisung ohne Beteiligung: „Ab morgen … Verstanden?“ setzt unter Druck.',
            tipp: 'Wird hier etwas vorgeschlagen – oder angeordnet?'
          },
          {
            nummer: 3,
            text: '„Wenn Sie so weitermachen, landen Sie bald wieder im Krankenhaus.“',
            richtig: 'D',
            erklaerung: 'Mit einer negativen Folge wird Druck gemacht – das weckt Angst und Widerstand.',
            tipp: 'Achten Sie auf „Wenn Sie so weitermachen …“ – was wird da angekündigt?'
          },
          {
            nummer: 4,
            text: 'Frau Schneider hat Angst vor dem Pen. Die Pflegekraft: „Ach, das ist doch kein Problem!“',
            richtig: 'BA',
            erklaerung: 'Die Angst wird heruntergespielt – Frau Schneider fühlt sich nicht ernst genommen.',
            tipp: 'Wird die Sorge ernst genommen – oder kleingeredet?'
          },
          {
            nummer: 5,
            text: '„Trinken Sie doch einfach mehr Wasser, dann geht das schon.“',
            richtig: 'R',
            erklaerung: '„Doch einfach …“ – ein schneller Rat statt gemeinsamer Lösungssuche.',
            tipp: 'Achten Sie auf „doch einfach …“. Wird hier gemeinsam gesucht?'
          },
          {
            nummer: 6,
            text: '„Sonst bekommen Sie bald Probleme mit Ihren Füßen.“',
            richtig: 'D',
            erklaerung: '„Sonst …“ kündigt eine Folge an, um Druck zu machen.',
            tipp: 'Was signalisiert das Wort „Sonst …“?'
          }
        ]
      },
      {
        ueberschrift: 'Teil 2 · Welche Gesprächsbremse steckt drin? (2)',
        anweisung: 'Ordnen Sie jede Aussage bzw. Situation zu.',
        antworten: [
          { kuerzel: 'BL', text: 'belehren' },
          { kuerzel: 'U', text: 'unterbrechen' },
          { kuerzel: 'T', text: 'Thema wechseln' },
          { kuerzel: 'F', text: 'Fachsprache' }
        ],
        karten: [
          {
            nummer: 7,
            text: '„Wer Diabetes hat, sollte so etwas eigentlich wissen.“',
            richtig: 'BL',
            erklaerung: 'Ein Vorwurf von oben herab – die Person fühlt sich bloßgestellt.',
            tipp: 'Wie fühlt man sich, wenn jemand sagt: „Das sollten Sie eigentlich wissen“?'
          },
          {
            nummer: 8,
            text: 'Herr Meier erzählt von seiner verstorbenen Frau. Die Pflegekraft: „Wie geht es eigentlich Ihren Enkeln?“',
            richtig: 'T',
            erklaerung: 'Ein für Herrn Meier wichtiges Thema wird übergangen.',
            tipp: 'Geht die Pflegekraft auf das ein, was Herr Meier gerade erzählt?'
          },
          {
            nummer: 9,
            text: '„Ihr HbA1c ist deutlich zu hoch.“',
            richtig: 'F',
            erklaerung: 'Ein Fachbegriff ohne Erklärung – die Person versteht vermutlich nicht, worum es geht.',
            tipp: 'Würde ein Laie das Wort „HbA1c“ verstehen?'
          },
          {
            nummer: 10,
            text: 'Frau Kühn beginnt: „Ich habe Angst, dass ich …“ – die Pflegekraft: „Moment, ich erkläre Ihnen erst mal, wie das läuft.“',
            richtig: 'U',
            erklaerung: 'Frau Kühn kann ihr Anliegen nicht zu Ende sagen.',
            tipp: 'Darf Frau Kühn ihren Satz beenden?'
          },
          {
            nummer: 11,
            text: '„Das hätten Sie sich aber auch selbst denken können.“',
            richtig: 'BL',
            erklaerung: 'Ein Vorwurf („hätten Sie … können“) – die Person wird beschämt statt unterstützt.',
            tipp: 'Klingt das nach Unterstützung – oder nach einem Vorwurf?'
          }
        ]
      },
      {
        ueberschrift: 'Teil 3 · Wirkung und Urteil',
        anweisung: 'So beurteilen Sie eine Aussage im Hinblick auf eine professionelle Beratung.',
        karten: [
          {
            nummer: 12,
            text: 'Nach einer Belehrung dreht sich die Patientin weg und sagt nur noch: „Ja, ja.“ Was zeigt diese Reaktion?',
            antworten: [
              { kuerzel: 'Z', text: 'Sie ist überzeugt und macht mit.' },
              { kuerzel: 'A', text: 'Rückzug und Abwehr – das Gespräch ist abgebrochen.' }
            ],
            richtig: 'A',
            erklaerung: 'Körpersprache und knappe Antworten zeigen Rückzug. Genau diese Wirkung gehört in eine Beurteilung.',
            tipp: 'Wendet man sich jemandem zu, der einen überzeugt hat – oder ab?'
          },
          {
            nummer: 13,
            text: 'Frau Schneider: „Die Fußkontrolle jeden Abend nervt mich. Ich vergesse das ständig.“ Welche Reaktion ist professionell?',
            antworten: [
              { kuerzel: 'X', text: '„Ach, das ist doch nur eine Minute – das schaffen Sie schon.“' },
              { kuerzel: 'Y', text: '„Das klingt anstrengend. Was könnte Ihnen helfen, im Alltag daran zu denken?“' },
              { kuerzel: 'W', text: '„Sie müssen das jetzt einfach jeden Abend machen.“' }
            ],
            richtig: 'Y',
            erklaerung: 'Die Pflegekraft nimmt Frau Schneiders Ärger ernst und lässt sie selbst nach einer Lösung suchen – ergebnisoffen und partizipativ.',
            tipp: 'Welche Reaktion lässt Frau Schneider selbst mitentscheiden?'
          },
          {
            nummer: 14,
            text: 'Warum ist eine Belehrung keine professionelle Beratung?',
            antworten: [
              { kuerzel: 'L', text: 'Weil sie zu lange dauert.' },
              { kuerzel: 'V', text: 'Weil die Lösung vorgegeben wird – nicht ergebnisoffen und nicht partizipativ.' },
              { kuerzel: 'N', text: 'Weil die Pflegekraft zu freundlich ist.' }
            ],
            richtig: 'V',
            erklaerung: 'Genau das ist das Urteil: keine professionelle Beratung, sondern Belehrung.',
            tipp: 'Denken Sie an die beiden Grundsätze guter Beratung vom AB „Beratungsansätze“.'
          }
        ]
      }
    ],

    // fett = die Wörter, die auf dem Arbeitsblatt in die Lücken gehören
    merksatz: 'Gesprächsbremsen wie Ratschläge, Befehle, Drohungen, **Bagatellisieren** und **Belehren** machen aus einer Beratung eine **Belehrung**. Sie ist dann weder **ergebnisoffen** noch **partizipativ**.'
  },

  /* ------------------------------------------------------------------------
     B1 – DIE 6 PHASEN DER BERATUNG (Seite phasen.html)
     ------------------------------------------------------------------------ */
  phasen: {
    titel: 'B1 · Die 6 Phasen der Beratung',
    anweisung: 'Bringen Sie die Phasen in die richtige Reihenfolge und ordnen Sie Sätze aus einem Beratungsgespräch zu.',

    mindestensErsterVersuch: 9,

    abschnitte: [
      {
        art: 'reihenfolge',
        ueberschrift: 'Teil 1 · Die Reihenfolge',
        anweisung: 'Tippen Sie die sechs Phasen in der richtigen Reihenfolge an.',
        schritte: [
          { text: 'Beziehung herstellen', tipp: 'Womit beginnt jedes gute Gespräch?' },
          { text: 'Beratungsbedürfnisse/-bedarfe erfassen', tipp: 'Bevor man Ziele festlegt: Was muss man zuerst herausfinden?' },
          { text: 'Beratungsziele aushandeln', tipp: 'Der Bedarf ist klar. Was wird jetzt gemeinsam vereinbart?' },
          { text: 'Lösungen entwickeln', tipp: 'Das Ziel steht. Was folgt jetzt?' },
          { text: 'Beratungsprozess reflektieren', tipp: 'Bevor das Gespräch endet: Was wird gemeinsam geprüft?' },
          { text: 'Beratung beenden', tipp: 'Welche Phase kommt ganz zum Schluss?' }
        ],
        erklaerung: 'Merken Sie sich die Reihenfolge – Sie schreiben die sechs Phasen gleich in B2 auf.'
      },
      {
        ueberschrift: 'Teil 2 · Welche Phase ist das?',
        anweisung: 'Lina berät Frau Schneider. Zu welcher Phase passt der Satz?',
        karten: [
          {
            nummer: 1,
            text: '„Guten Tag, Frau Schneider. Wie geht es Ihnen heute? Haben Sie ein paar Minuten Zeit für mich?“',
            antworten: [
              { kuerzel: 'P1', text: 'Beziehung herstellen' },
              { kuerzel: 'P3', text: 'Beratungsziele aushandeln' },
              { kuerzel: 'P6', text: 'Beratung beenden' }
            ],
            richtig: 'P1',
            erklaerung: 'Begrüßung und Kontakt – Phase 1 schafft Vertrauen.',
            tipp: 'Steht das am Anfang oder am Ende des Gesprächs?'
          },
          {
            nummer: 2,
            text: '„Was beschäftigt Sie im Moment am meisten?“',
            antworten: [
              { kuerzel: 'P5', text: 'Beratungsprozess reflektieren' },
              { kuerzel: 'P2', text: 'Beratungsbedürfnisse/-bedarfe erfassen' },
              { kuerzel: 'P4', text: 'Lösungen entwickeln' }
            ],
            richtig: 'P2',
            erklaerung: 'Eine offene Frage nach ihrer Sicht – so erfasst Lina den Beratungsbedarf.',
            tipp: 'Will Lina hier etwas herausfinden – oder schon etwas lösen?'
          },
          {
            nummer: 3,
            text: '„Was möchten Sie nach unserem Gespräch besser verstehen oder sicherer können?“',
            antworten: [
              { kuerzel: 'P2', text: 'Beratungsbedürfnisse/-bedarfe erfassen' },
              { kuerzel: 'P3', text: 'Beratungsziele aushandeln' },
              { kuerzel: 'P6', text: 'Beratung beenden' }
            ],
            richtig: 'P3',
            erklaerung: 'Lina klärt gemeinsam mit Frau Schneider, was erreicht werden soll.',
            tipp: 'Es geht um das, was am Ende des Gesprächs erreicht sein soll.'
          },
          {
            nummer: 4,
            text: '„Welche Möglichkeiten sehen Sie selbst? Ich kann Ihnen auch zwei Wege zeigen – dann entscheiden Sie.“',
            antworten: [
              { kuerzel: 'P4', text: 'Lösungen entwickeln' },
              { kuerzel: 'P1', text: 'Beziehung herstellen' },
              { kuerzel: 'P5', text: 'Beratungsprozess reflektieren' }
            ],
            richtig: 'P4',
            erklaerung: 'Gemeinsam Lösungen suchen, Wahlmöglichkeiten zeigen statt Ratschläge geben.',
            tipp: 'Hier werden Möglichkeiten gesammelt. In welcher Phase passiert das?'
          },
          {
            nummer: 5,
            text: '„Was war heute für Sie besonders hilfreich? Was ist noch unklar?“',
            antworten: [
              { kuerzel: 'P3', text: 'Beratungsziele aushandeln' },
              { kuerzel: 'P5', text: 'Beratungsprozess reflektieren' },
              { kuerzel: 'P2', text: 'Beratungsbedürfnisse/-bedarfe erfassen' }
            ],
            richtig: 'P5',
            erklaerung: 'Rückblick auf das Gespräch – Lina prüft mit Frau Schneider, was hilfreich war.',
            tipp: 'Blickt Lina hier nach vorne – oder zurück auf das Gespräch?'
          },
          {
            nummer: 6,
            text: '„Dann halten wir fest: … Beim nächsten Besuch schauen wir gemeinsam, wie es geklappt hat.“',
            antworten: [
              { kuerzel: 'P4', text: 'Lösungen entwickeln' },
              { kuerzel: 'P1', text: 'Beziehung herstellen' },
              { kuerzel: 'P6', text: 'Beratung beenden' }
            ],
            richtig: 'P6',
            erklaerung: 'Ergebnisse sichern, nächsten Termin vereinbaren, das Gespräch abschließen.',
            tipp: 'Kommt danach noch etwas – oder ist das Gespräch fertig?'
          }
        ]
      },
      {
        ueberschrift: 'Teil 3 · Phase 2 genauer: Wer macht den Bedarf deutlich?',
        anweisung: 'In Phase 2 gibt es zwei Arten von Beratungsbedarf.',
        antworten: [
          { kuerzel: 'S', text: 'selbst geäußerter Bedarf' },
          { kuerzel: 'P', text: 'pflegefachlich erkannter Bedarf' }
        ],
        karten: [
          {
            nummer: 7,
            text: 'Herr Meier sagt: „Ich weiß gar nicht, wie ich nach der Reha wieder fit werden soll.“',
            richtig: 'S',
            erklaerung: 'Herr Meier spricht seine Unsicherheit selbst aus.',
            tipp: 'Wer spricht hier den Bedarf aus – Herr Meier oder die Pflegekraft?'
          },
          {
            nummer: 8,
            text: 'Lina bemerkt bei Herrn Meier eine Druckstelle am Fuß, die er selbst nicht spürt.',
            richtig: 'P',
            erklaerung: 'Lina erkennt den Bedarf durch Beobachtung und Fachwissen – Herr Meier selbst bemerkt ihn nicht.',
            tipp: 'Weiß Herr Meier selbst von der Druckstelle?'
          }
        ]
      }
    ],

    // fett = die Wörter, die auf dem Arbeitsblatt in die Lücken gehören
    merksatz: 'In Phase 2 erfasse ich den Beratungsbedarf: Ich frage nach der **Sicht** der Person, höre zu und ordne meine **Beobachtungen** ein. Der Bedarf kann **selbst geäußert** oder **pflegefachlich erkannt** sein.'
  },

  /* ------------------------------------------------------------------------
     C1 – ANGEHÖRIGE EINBEZIEHEN (Seite angehoerige.html)
     ------------------------------------------------------------------------ */
  angehoerige: {
    titel: 'C1 · Angehörige einbeziehen',
    anweisung: 'Angehörige können eine große Hilfe sein – aber die Beratung gilt der Person selbst. Lesen Sie die Infokarte und entscheiden Sie.',

    infokarten: [
      {
        titel: '👪 So beziehe ich Angehörige professionell ein',
        offen: true,
        punkte: [
          '**Nur mit Einverständnis** der beratenen Person – denn es gilt die Schweigepflicht.',
          '**Gemeinsam sprechen** – nicht über den Kopf der Person hinweg.',
          'Die **Entscheidung bleibt bei der beratenen Person** – sie hat ein Recht auf Selbstbestimmung (Autonomie).',
          '**Alle Sichtweisen erfragen** und keine Partei ergreifen – sonst geht Vertrauen verloren.',
          'Die **Belastung der Angehörigen wahrnehmen** – auch sie brauchen manchmal Unterstützung.'
        ]
      }
    ],

    mindestensErsterVersuch: 4,

    abschnitte: [
      {
        ueberschrift: 'Teil 1 · Die Tochter von Frau Schneider ruft an',
        anweisung: 'Die Tochter sagt am Telefon: „Sagen Sie mir bitte genau, wie Mamas Werte sind. Und sagen Sie ihr, dass sie keinen Kuchen mehr essen darf – auf mich hört sie ja nicht.“',
        karten: [
          {
            nummer: 1,
            text: 'Darf Lina der Tochter am Telefon die Blutzuckerwerte nennen?',
            antworten: [
              { kuerzel: 'J', text: 'Ja – sie ist ja die Tochter.' },
              { kuerzel: 'E', text: 'Nur, wenn Frau Schneider einverstanden ist.' }
            ],
            richtig: 'E',
            erklaerung: 'Es gilt die Schweigepflicht – auch gegenüber Angehörigen. Ohne Einverständnis von Frau Schneider gibt Lina keine Auskunft.',
            tipp: 'Welche Pflicht gilt für Pflegende auch gegenüber der Familie?'
          },
          {
            nummer: 2,
            text: 'Die Tochter möchte, dass Lina ihrer Mutter den Kuchen verbietet. Was ist professionell?',
            antworten: [
              { kuerzel: 'D', text: 'Lina setzt den Wunsch der Tochter bei Frau Schneider durch.' },
              { kuerzel: 'G', text: 'Lina bespricht das Thema mit Frau Schneider selbst; entscheiden wird Frau Schneider.' }
            ],
            richtig: 'G',
            erklaerung: 'Die Entscheidung bleibt bei Frau Schneider (Autonomie). Lina berät sie – nicht über ihren Kopf hinweg.',
            tipp: 'Wer ist die beratene Person – und wer entscheidet über ihr Leben?'
          },
          {
            nummer: 3,
            text: '„Auf mich hört sie ja nicht.“ Wie reagiert Lina professionell?',
            antworten: [
              { kuerzel: 'P', text: '„Da haben Sie recht – Ihre Mutter ist wirklich schwierig.“' },
              { kuerzel: 'S', text: '„Das klingt, als ob Sie sich große Sorgen machen. Wie geht es Ihnen damit?“' },
              { kuerzel: 'N', text: '„Das ist nicht mein Problem.“' }
            ],
            richtig: 'S',
            erklaerung: 'Lina nimmt die Sorge der Tochter wahr, ergreift aber keine Partei gegen Frau Schneider.',
            tipp: 'Welche Antwort nimmt die Tochter ernst, ohne sich gegen Frau Schneider zu stellen?'
          }
        ]
      },
      {
        ueberschrift: 'Teil 2 · Herr Meier und seine Frau',
        anweisung: 'Herr Meier wird zu Hause beraten. Seine Frau ist dabei.',
        karten: [
          {
            nummer: 4,
            text: 'Herr Meier möchte, dass seine Frau beim Gespräch dabei ist. Was gilt?',
            antworten: [
              { kuerzel: 'V', text: 'Das ist verboten – Beratung nur unter vier Augen.' },
              { kuerzel: 'O', text: 'Gern – mit seinem Einverständnis ist das möglich und kann hilfreich sein.' }
            ],
            richtig: 'O',
            erklaerung: 'Mit Einverständnis darf und soll die Familie einbezogen werden – sie ist oft eine wichtige Ressource.',
            tipp: 'Herr Meier wünscht es selbst. Was ist dann entscheidend?'
          },
          {
            nummer: 5,
            text: 'Frau Meier antwortet ständig für ihren Mann: „Er will sowieso nicht spazieren gehen.“ Was tut Lina?',
            antworten: [
              { kuerzel: 'F', text: 'Sie spricht ab jetzt nur noch mit Frau Meier.' },
              { kuerzel: 'Z', text: 'Sie wendet sich Herrn Meier zu und fragt nach seiner Sicht; danach darf Frau Meier ergänzen.' }
            ],
            richtig: 'Z',
            erklaerung: 'Lina spricht mit Herrn Meier, nicht über ihn – und erfragt beide Sichtweisen.',
            tipp: 'Wer ist die beratene Person?'
          },
          {
            nummer: 6,
            text: 'Wer entscheidet am Ende, was Herr Meier in seinem Alltag ändert?',
            antworten: [
              { kuerzel: 'F', text: 'seine Frau' },
              { kuerzel: 'L', text: 'Lina' },
              { kuerzel: 'M', text: 'Herr Meier selbst' }
            ],
            richtig: 'M',
            erklaerung: 'Die Entscheidung bleibt bei der beratenen Person – das ist Selbstbestimmung (Autonomie).',
            tipp: 'Denken Sie an den Grundsatz „partizipativ“ – wessen Entscheidung ist es?'
          }
        ]
      }
    ],

    // fett = die Wörter, die auf dem Arbeitsblatt in die Lücken gehören
    merksatz: 'Angehörige beziehe ich nur mit **Einverständnis** ein (Schweigepflicht). Ich spreche **mit** der Person, nicht über ihren Kopf hinweg. Die **Entscheidung** bleibt bei ihr.'
  }
};
