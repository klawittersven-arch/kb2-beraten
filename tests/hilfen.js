/* Gemeinsame Hilfen für die automatischen Tests (Playwright, Chromium).
 * Start: siehe tests/README.md */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DOCS = path.resolve(__dirname, '..', 'docs');
const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8'
};

/* Lokaler Webserver für docs/. In config.js wird FORTSCHRITT_URL immer ersetzt:
 * ohne Angabe durch '' (Fortschrittsanzeige aus), sonst durch die Adresse des Test-Workers. */
function serverStarten(optionen = {}) {
  const fortschrittUrl = optionen.fortschrittUrl || '';
  return new Promise((ok) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const datei = path.join(DOCS, p);
      if (!datei.startsWith(DOCS) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()) {
        res.writeHead(404); res.end('nicht gefunden'); return;
      }
      res.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      if (path.basename(datei) === 'config.js') {
        res.end(fs.readFileSync(datei, 'utf8').replace(/FORTSCHRITT_URL: '[^']*'/, `FORTSCHRITT_URL: '${fortschrittUrl}'`));
        return;
      }
      fs.createReadStream(datei).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => ok({ server, basis: `http://127.0.0.1:${server.address().port}/` }));
  });
}

let fehlerZahl = 0;
let pruefZahl = 0;
function pruefe(bedingung, text, details) {
  pruefZahl++;
  if (bedingung) console.log('  ✓ ' + text);
  else { fehlerZahl++; console.log('  ✗ ' + text + (details !== undefined ? '  → ' + JSON.stringify(details) : '')); }
}
function ergebnis() {
  console.log(`\n${pruefZahl - fehlerZahl} von ${pruefZahl} Prüfungen bestanden.`);
  return fehlerZahl === 0;
}

const MOBIL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

/* Beobachtet Konsolenfehler und Anfragen an fremde Adressen */
function beobachten(seite, protokoll, name) {
  seite.on('console', (m) => { if (m.type() === 'error') protokoll.konsole.push(`[${name}] ${m.text()}`); });
  seite.on('pageerror', (e) => protokoll.konsole.push(`[${name}] ${e.message}`));
  seite.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:') && !u.startsWith('blob:')) protokoll.extern.push(u);
  });
}

/* Startet den Cloudflare-Worker lokal (wrangler dev, Durable Objects im Speicher).
 * Voraussetzung: Repository kb1-diabetes daneben (oder KB1_REPO=Pfad) und dort in worker/ einmal „npm install“. */
const { spawn } = require('child_process');
function workerStarten(port, lebensdauerMinuten = 360) {
  // Der Worker gehört zum Repository kb1-diabetes (beide Apps nutzen denselben Dienst).
  const WURZEL = path.resolve(process.env.KB1_REPO || path.join(__dirname, '..', '..', 'kb1-diabetes'));
  const WRANGLER = path.join(WURZEL, 'worker', 'node_modules', '.bin', 'wrangler');
  const zustand = fs.mkdtempSync(path.join(require('os').tmpdir(), 'kb1-wrangler-'));
  const kind = spawn(WRANGLER, ['dev', '--config', path.join(WURZEL, 'wrangler.jsonc'), '--port', String(port), '--ip', '127.0.0.1',
    '--var', `LEBENSDAUER_MINUTEN:${lebensdauerMinuten}`, '--persist-to', zustand, '--show-interactive-dev-session=false'],
  { cwd: WURZEL, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' } });
  let log = '';
  kind.stdout.on('data', (d) => { log += d; });
  kind.stderr.on('data', (d) => { log += d; });
  const url = `http://127.0.0.1:${port}`;
  return new Promise((ok, fehler) => {
    const start = Date.now();
    (function warten() {
      fetch(url + '/').then((r) => (r.ok ? ok({ url, beenden: () => kind.kill('SIGTERM') }) : setTimeout(warten, 300)))
        .catch(() => {
          if (Date.now() - start > 60000) { kind.kill('SIGTERM'); fehler(new Error('Worker startet nicht:\n' + log)); } else setTimeout(warten, 300);
        });
    })();
  });
}

module.exports = { chromium, serverStarten, workerStarten, pruefe, ergebnis, MOBIL, beobachten, DOCS };
