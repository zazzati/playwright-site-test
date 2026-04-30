#!/usr/bin/env node
/**
 * scripts/test-runner-server.js
 *
 * Server HTTP che permette di lanciare i test Playwright tramite URL.
 *
 * Endpoint:
 *   GET  /run           → esegue tutti i siti in sequenza
 *   GET  /run?site=xxx  → esegue solo il sito specificato
 *   GET  /sites         → elenca i siti disponibili
 *   GET  /status        → mostra se è in corso un'esecuzione
 *
 * Al termine di ogni run stampa la URL del report e la include
 * nell'output dell'endpoint.
 *
 * Avvio:
 *   node scripts/test-runner-server.js          → porta 3100
 *   PORT=8080 node scripts/test-runner-server.js
 */

'use strict';

const http      = require('http');
const https     = require('https');
const { spawn } = require('child_process');
const fs        = require('fs');
const path      = require('path');
const os        = require('os');
const { spawnSync } = require('child_process');

const ROOT      = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'tests');
const PORT      = parseInt(process.env.PORT || '3100', 10);
const EXCLUDED_DIRS = new Set(['api', 'e2e', 'fixtures']);

const CERT_DIR  = process.env.CERT_DIR || '/etc/letsencrypt/live/relistim.it';
const CERT_FILE = path.join(CERT_DIR, 'fullchain.pem');
const KEY_FILE  = path.join(CERT_DIR, 'privkey.pem');
const SSL_AVAILABLE = fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE);

// ─── Helpers ────────────────────────────────────────────────────────────────

function getServerIP() {
  try {
    const out = spawnSync('ip', ['route', 'get', '1'], { encoding: 'utf8' }).stdout;
    const m = out.match(/src\s+(\S+)/);
    if (m) return m[1];
  } catch (_) {}
  const ifaces = os.networkInterfaces();
  for (const iface of Object.values(ifaces)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return 'localhost';
}

function discoverSites() {
  if (!fs.existsSync(TESTS_DIR)) return [];
  return fs
    .readdirSync(TESTS_DIR)
    .filter((d) => {
      if (EXCLUDED_DIRS.has(d)) return false;
      return fs.statSync(path.join(TESTS_DIR, d)).isDirectory();
    })
    .sort();
}

function parseQuery(url) {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const qs = url.slice(idx + 1);
  return Object.fromEntries(
    qs.split('&').map((p) => p.split('=').map(decodeURIComponent))
  );
}

// ─── State ───────────────────────────────────────────────────────────────────

let runState = null; // null = idle, object = running

// ─── Runner ──────────────────────────────────────────────────────────────────

/**
 * Avvia run-tests.js come processo figlio e accumula l'output.
 * Restituisce una Promise che risolve con { output, exitCode, reportUrl }.
 */
function launchRun(site) {
  const args = site ? [`--site=${site}`] : [];
  return new Promise((resolve) => {
    const lines = [];
    const child = spawn('node', ['scripts/run-tests.js', ...args], {
      cwd:   ROOT,
      env:   process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (d) => {
      const text = d.toString();
      process.stdout.write(text); // mirror to server console
      lines.push(...text.split('\n'));
    });
    child.stderr.on('data', (d) => {
      const text = d.toString();
      process.stderr.write(text);
      lines.push(...text.split('\n'));
    });

    child.on('close', (code) => {
      const ip          = getServerIP();
      const reportPort  = parseInt(process.env.REPORT_PORT || '80', 10);
      const reportUrl   = `http://${ip}${reportPort === 80 ? '' : ':' + reportPort}`;
      const sitePath    = site ? `?site=${encodeURIComponent(site)}` : '';
      const fullReport  = `${reportUrl}${sitePath}`;
      lines.push('');
      lines.push(`📊  Report disponibile su: ${fullReport}`);
      console.log(`\n📊  Report: ${fullReport}\n`);
      resolve({ output: lines.join('\n'), exitCode: code ?? 0, reportUrl: fullReport });
    });
  });
}

// ─── Request handler ─────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const urlPath = req.url.split('?')[0];
  const query   = parseQuery(req.url || '');

  // GET /sites
  if (req.method === 'GET' && urlPath === '/sites') {
    const sites = discoverSites();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ sites }));
    return;
  }

  // GET /status
  if (req.method === 'GET' && urlPath === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (runState) {
      res.end(JSON.stringify({ running: true, site: runState.site, startedAt: runState.startedAt }));
    } else {
      res.end(JSON.stringify({ running: false }));
    }
    return;
  }

  // GET /run[?site=xxx]
  if (req.method === 'GET' && urlPath === '/run') {
    const site      = query.site || null;
    const allSites  = discoverSites();

    if (site && !allSites.includes(site)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Sito "${site}" non trovato. Disponibili: ${allSites.join(', ')}` }));
      return;
    }

    if (runState) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Un\'esecuzione è già in corso', runningState: runState }));
      return;
    }

    // Stream chunked response so il client vede l'output in tempo reale
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    });

    const label = site ? site : 'tutti i siti';
    res.write(`▶  Avvio esecuzione per: ${label}\n\n`);

    runState = { site: site || 'all', startedAt: new Date().toISOString() };

    try {
      const { output, exitCode, reportUrl } = await launchRun(site);
      res.write(output);
      res.write(`\n\nExit code: ${exitCode}\n`);
      res.write(`\n📊  Visualizza il report: ${reportUrl}\n`);
    } finally {
      runState = null;
    }

    res.end();
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not found',
    endpoints: [
      'GET /run           → esegue tutti i siti',
      'GET /run?site=xxx  → esegue solo il sito specificato',
      'GET /sites         → elenca i siti disponibili',
      'GET /status        → stato corrente del runner',
    ],
  }));
}

// ─── Start ───────────────────────────────────────────────────────────────────

function createHandler() {
  return (req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error('❌ Errore nel handler:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  };
}

if (SSL_AVAILABLE) {
  const tlsOptions = {
    cert: fs.readFileSync(CERT_FILE),
    key:  fs.readFileSync(KEY_FILE),
  };
  https.createServer(tlsOptions, createHandler()).listen(PORT, '0.0.0.0', () => {
    const ip = getServerIP();
    const proto = 'https';
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║      Test Runner Server in ascolto (HTTPS)           ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🌐  Server:  ${proto}://${ip}:${PORT}`);
    console.log('');
    console.log(`   Esegui tutti i test:      ${proto}://${ip}:${PORT}/run`);
    console.log(`   Esegui un singolo sito:   ${proto}://${ip}:${PORT}/run?site=csipiemonte`);
    console.log(`   Elenca siti disponibili:  ${proto}://${ip}:${PORT}/sites`);
    console.log(`   Stato esecuzione:         ${proto}://${ip}:${PORT}/status`);
    console.log('');
  });
} else {
  http.createServer(createHandler()).listen(PORT, '0.0.0.0', () => {
    const ip = getServerIP();
    const proto = 'http';
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║          Test Runner Server in ascolto               ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🌐  Server:  ${proto}://${ip}:${PORT}`);
    console.log('');
    console.log(`   Esegui tutti i test:      ${proto}://${ip}:${PORT}/run`);
    console.log(`   Esegui un singolo sito:   ${proto}://${ip}:${PORT}/run?site=csipiemonte`);
    console.log(`   Elenca siti disponibili:  ${proto}://${ip}:${PORT}/sites`);
    console.log(`   Stato esecuzione:         ${proto}://${ip}:${PORT}/status`);
    console.log('');
  });
}
