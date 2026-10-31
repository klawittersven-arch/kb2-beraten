/* ==========================================================================
   EINSTELLUNGEN – Fortschrittsanzeige am Beamer
   ==========================================================================
   Ändern Sie nur die Werte rechts vom Doppelpunkt.
   ========================================================================== */

var CONFIG = {

  // Adresse des Cloudflare-Workers für die Fortschrittsanzeige
  // Gemeinsamer Dienst mit der KB1-App (Cloudflare-Projekt „kb1-diabetes“, siehe README).
  // Leer ('') = Anzeige ausgeschaltet; die Übungen funktionieren dann wie
  // gewohnt ohne Anmeldung.
  FORTSCHRITT_URL: 'https://kb1-diabetes.klawittersven.workers.dev',

  // So viele Stunden merkt sich ein Handy Vorname und Raumcode.
  RAUMCODE_GUELTIG_STUNDEN: 3,

  // So viele Sekunden wartet die Beamer-Seite zwischen zwei Abfragen.
  ABFRAGE_SEKUNDEN: 3,

  // Ein Eintrag wird am Beamer blasser dargestellt, wenn sich so viele
  // Minuten nichts mehr getan hat.
  RUHIG_MINUTEN: 10,

  // Einfacher Filter für Vornamen: Enthält ein Name eines dieser Wörter
  // (Groß-/Kleinschreibung egal, auch mit Leerzeichen oder Ziffern wie „4“
  // statt „a“ dazwischen), wird er abgelehnt. Nur Kleinbuchstaben verwenden.
  SPERRWOERTER: [
    'arsch', 'fick', 'fotze', 'hure', 'nutte', 'wichs', 'schlampe', 'bitch',
    'fuck', 'shit', 'scheis', 'kacke', 'pisse', 'penis', 'pimmel', 'schwanz',
    'muschi', 'vagina', 'titte', 'porn', 'sex', 'nazi', 'hitler',
    'neger', 'nigg', 'kanake', 'zigeuner', 'schwuchtel', 'spast', 'mongo',
    'behindert', 'missgeburt', 'bastard', 'wixer', 'wixxer', 'opfer',
    'dick', 'cock', 'pussy', 'slut', 'whore', 'cunt', 'kill'
  ]
};
