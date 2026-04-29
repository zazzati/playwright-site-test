#!/usr/bin/env node
/**
 * CLI per eseguire i test Playwright.
 *
 * Utilizzo:
 *   node scripts/run-tests.js                   → tutti i siti in sequenza
 *   node scripts/run-tests.js --site=csipiemonte → solo il sito specificato
 *
 * Ogni esecuzione genera un RUN_ID univoco e salva i risultati in:
 *   test-results/{nomesito}/{run_id}/
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT, 'tests');
const RESULTS_DIR = path.join(ROOT, 'test-results');
const MAX_RUNS_PER_SITE = 5;

// Directories inside tests/ that are NOT site names
const EXCLUDED_DIRS = new Set(['api', 'e2e', 'fixtures']);

// Delete oldest runs keeping only MAX_RUNS_PER_SITE for a given site
function cleanupOldRuns(site) {
  const siteDir = path.join(RESULTS_DIR, site);
  if (!fs.existsSync(siteDir)) return;
  const runs = fs
    .readdirSync(siteDir)
    .filter((d) => d.startsWith('run_') && fs.statSync(path.join(siteDir, d)).isDirectory())
    .sort(); // ascending → oldest first
  const toDelete = runs.slice(0, Math.max(0, runs.length - MAX_RUNS_PER_SITE));
  for (const run of toDelete) {
    const runPath = path.join(siteDir, run);
    fs.rmSync(runPath, { recursive: true, force: true });
    console.log(`🗑️   Rimossa run vecchia: ${site}/${run}`);
  }
}

// Discover available sites from the tests/ directory
function discoverSites() {
  return fs
    .readdirSync(TESTS_DIR)
    .filter((d) => {
      if (EXCLUDED_DIRS.has(d)) return false;
      return fs.statSync(path.join(TESTS_DIR, d)).isDirectory();
    })
    .sort();
}

// Parse --site=name from CLI arguments
const args = process.argv.slice(2);
const siteArg = args.find((a) => a.startsWith('--site='));
const requestedSite = siteArg ? siteArg.split('=')[1] : null;

const allSites = discoverSites();

if (allSites.length === 0) {
  console.error('❌  Nessun sito trovato in tests/. Crea prima una directory per il sito.');
  process.exit(1);
}

// Validate requested site
if (requestedSite && !allSites.includes(requestedSite)) {
  console.error(`❌  Sito "${requestedSite}" non trovato. Siti disponibili: ${allSites.join(', ')}`);
  process.exit(1);
}

const sitesToRun = requestedSite ? [requestedSite] : allSites;

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║         Test Automation Runner               ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

if (requestedSite) {
  console.log(`🎯  Sito: ${requestedSite}`);
} else {
  console.log(`🎯  Siti da eseguire: ${sitesToRun.join(', ')}`);
}
console.log('');

let overallFailed = false;

for (const site of sitesToRun) {
  const runId = `run_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`;
  const outputPath = `test-results/${site}/${runId}/`;

  console.log(`──────────────────────────────────────────────`);
  console.log(`▶  Site:  ${site}`);
  console.log(`   Run:   ${runId}`);
  console.log(`   Output: ${outputPath}`);
  console.log('');

  const env = {
    ...process.env,
    RUN_ID: runId,
    PROJECT_NAME: site,
  };

  const result = spawnSync(
    'npx',
    ['playwright', 'test', '--project', site],
    { stdio: 'inherit', env, cwd: ROOT },
  );

  if (result.error) {
    console.error(`❌  Errore nell'avvio di Playwright: ${result.error.message}`);
    overallFailed = true;
    continue;
  }

  if (result.status !== 0) {
    console.log(`\n⚠️   Alcuni test sono falliti per il sito "${site}" (exit code ${result.status})`);
    overallFailed = true;
  } else {
    console.log(`\n✅  Tutti i test superati per il sito "${site}"`);
  }

  // Keep only the last MAX_RUNS_PER_SITE runs for this site
  cleanupOldRuns(site);
  console.log('');
}

console.log('══════════════════════════════════════════════');
if (overallFailed) {
  console.log('⚠️   Esecuzione completata con errori.');
  process.exit(1);
} else {
  console.log('✅  Tutte le esecuzioni completate con successo.');
}
console.log('');
console.log('💡  Visualizza i report con:  npm run report');
console.log('');
