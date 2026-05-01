import { defineConfig, devices } from '@playwright/test';

// RUN_ID viene impostato da run-monitor.sh tramite variabile d'ambiente.
// Se non è impostato (es. esecuzione manuale), viene generato al momento.
const RUN_ID =
  process.env.RUN_ID ||
  `run_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`;

// Nome del sito/progetto corrente (impostato da run-monitor.sh)
const PROJECT_NAME = process.env.PROJECT_NAME || 'default';

// Struttura: test-results/{nome_sito}/{run_id}/
const OUTPUT_DIR = `test-results/${PROJECT_NAME}/${RUN_ID}`;

export default defineConfig({
  // Directory radice dei test (usata come fallback dai project che non ne definiscono una)
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Cartella degli artefatti (screenshot, video, trace)
  outputDir: `${OUTPUT_DIR}/artifacts`,

  // Reporter multipli: JSON per i dati grezzi, custom per step+screenshot, HTML per ispezione visiva
  reporter: [
    ['json', { outputFile: `${OUTPUT_DIR}/results.json` }],
    ['html', { outputFolder: `${OUTPUT_DIR}/html`, open: 'never' }],
    ['./reporters/steps-reporter'],
    ['list'],
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'on',        // scatta sempre uno screenshot a fine test
    video: 'retain-on-failure',
  },

  // Un project per ogni sito monitorato — aggiungi nuovi siti qui
  projects: [
    {
      name: 'csipiemonte',
      testDir: './tests/csipiemonte',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'regionepiemonte',
      testDir: './tests/regionepiemonte',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
