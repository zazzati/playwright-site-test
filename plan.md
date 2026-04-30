# Playwright Monitoring Architecture — Piano e Code Review

> Documento aggiornato dopo code review del 2026-04-30.
> La sezione originale del prompt architetturale è conservata invariata in fondo.

---

## Stato Attuale dell'Implementazione

### ✅ Completato
| Requisito | File/Componente | Note |
|---|---|---|
| Struttura per sito isolato | `tests/csipiemonte/` | Un progetto Playwright per sito |
| Output versionato con timestamp | `playwright.config.ts`, `scripts/run-tests.js` | `RUN_ID` = `run_YYYY-MM-DD_HH-MM-SS` |
| Report JSON | `playwright.config.ts` reporter `json` | `test-results/{sito}/{run_id}/results.json` |
| Report HTML Playwright | `playwright.config.ts` reporter `html` | `test-results/{sito}/{run_id}/html/` |
| Dashboard report custom | `show-report.js` + `dashboard.html` | Server HTTP su porta 80, `npm run report` |
| Report dati step+screenshot | `reporters/steps-reporter.ts` | `report-data.json` per ogni run |
| Notifiche Telegram | `notifiers/telegram.js` | Singolo test + riepilogo run |
| Setup Telegram one-time | `scripts/setup-telegram.js` | Polling getUpdates, salva `telegram.config.json` |
| CLI runner multi-sito | `scripts/run-tests.js` | `--site=nome`, cleanup automatico (max 5 run) |
| Test di esempio | `tests/csipiemonte/example.spec.ts` | 2 test (1 passa, 1 fallisce intenzionalmente) |
| Gestione variabili sensibili | `.env.example`, `telegram.config.json.example` | `dotenv` incluso |

### ⏳ Non ancora implementato
| Requisito originale | Stato | Note |
|---|---|---|
| `run-monitor.sh` (orchestratore shell) | ❌ Mancante | `npm run monitor` lo chiama ma il file non esiste |
| Alert email con `nodemailer` | ❌ Non implementato | Dipendenza `nodemailer` presente in package.json ma nessun `alert-system.js` |
| Page Object Model (`pages/`) | ❌ Vuoto | Directory creata ma nessun POM implementato |
| Shared fixtures (`tests/fixtures/`) | ❌ Vuoto | Directory creata ma nessuna fixture condivisa |
| Utilities (`utils/`) | ❌ Vuoto | Directory creata ma nessuna utility implementata |

---

## Code Review

### 🐛 Bug / Problemi Funzionali

**1. `npm run monitor` non funziona — `run-monitor.sh` mancante**
- `package.json` definisce `"monitor": "bash run-monitor.sh"` ma il file non esiste nel repo.
- **Fix**: creare `run-monitor.sh` oppure rimuovere lo script dal `package.json`.

**2. Costanti inutilizzate in `notifiers/telegram.js` (righe 15–17)**
```js
const BOT_TOKEN  = (loadConfig() || {}).botToken || process.env.TELEGRAM_BOT_TOKEN; // ← mai usato
const API_BASE   = `https://api.telegram.org/bot${BOT_TOKEN}`;                       // ← mai usato
```
- Tutte le funzioni usano `getApiBase()` che rilegge la config. Le due costanti al top level sono dead code.
- **Fix**: rimuovere le due costanti inutilizzate.

**3. Stray `}` nel blocco HTML legacy in `show-report.js` (riga 270)**
```js
+'<div class="site-header" id="'+hid+'" data-body="'+bid+'" onclick="toggle(this.id)">'}
```
- Il `}` interrompe la stringa. L'HTML inline non viene servito (è legacy/reference), ma è comunque un errore sintattico da risolvere se si vuole ripristinare la versione inline.

### ⚠️ Miglioramenti Consigliati

**4. Script `test:headed / test:ui / test:debug` senza `RUN_ID`**
- Questi script in `package.json` eseguono `playwright test` direttamente senza impostare `RUN_ID` o `PROJECT_NAME`.
- I report vengono generati con un timestamp auto-generato ma in una struttura `test-results/all/run_…/` che potrebbe confondere.
- **Suggerimento**: documentare questo comportamento nel quickstart o aggiungere un wrapper.

**5. `show-report.js` richiede porta 80 (privilegi root su Linux)**
- Il server di default usa la porta 80 (`REPORT_PORT=80`). Su Linux questo richiede `sudo` o `CAP_NET_BIND_SERVICE`.
- **Suggerimento**: cambiare il default a una porta alta (es. 8080) oppure documentare l'uso di `REPORT_PORT=8080 npm run report`.

**6. Sicurezza: path traversal in `serveScreenshot` (`show-report.js` riga 112)**
- La verifica usa `resolved.startsWith(RESULTS_DIR + path.sep)` che è corretta, ma va verificato che `RESULTS_DIR` non finisca già con `/`.
- Il controllo attuale è sufficiente, ma sarebbe più robusto usare `path.relative()`.

**7. Test intenzionalmente fallimentare incluso nel progetto**
- `tests/csipiemonte/example.spec.ts` contiene un test che **fallisce per design** (cerca "Novola" invece di "Nivola").
- Utile per demo ma potrebbe confondere chi clona il repo aspettandosi test verdi.
- **Suggerimento**: aggiungere un commento esplicito `// TEST DI DEMO — fallisce intenzionalmente`.

---

## Architettura Originale (Prompt Iniziale)

---

# AGENT PROMPT: Playwright Monitoring Architecture Setup

## Context and Role
You are an expert Senior QA Automation Engineer and DevOps. Your task is to generate the code, configuration, and scripts necessary to create a website monitoring framework based on **Playwright** (Node.js/TypeScript).

## Architectural Requirements

### 1. Project Structure and Isolation
- Each monitored site must have its own isolated folder within a main `tests/` directory (e.g., `tests/site_a/`, `tests/site_b/`).
- The `playwright.config.ts` file must use the "Projects" feature to map each site to its specific folder.

### 2. Output Versioning
- For each execution (run), all results must be saved in a **new versioned folder**, ideally named with a timestamp (e.g., `test-results/run_YYYY-MM-DD_HH-MM-SS/`).
- The timestamp logic must be managed globally so that HTML reports, JSON reports, and artifact files (screenshots, traces) all end up in the same folder for that specific execution.

### 3. Output Formats and Visualization
- For each execution, Playwright must generate two types of reports within the versioned folder:
  1. **JSON Report**: Mandatory for subsequent data processing.
  2. **HTML Report**: Mandatory to allow a human to visually inspect the tests (outcomes, screenshots, traces).
- Provide instructions or a `package.json` script on how to serve and view the generated HTML report in a specific folder.

### 4. Email Alert System (Summary and Error Priority)
- A custom Node.js script (e.g., `alert-system.js`) must be created using `nodemailer`.
- The script must run *after* the test execution.
- It must read the JSON file generated in the current versioned folder.
- **Email body logic:** 
  - It must compile a total summary report (e.g., "Total executed: 10, Passed: 8, Failed: 2").
  - **Strict Requirement:** In case of failed tests, the error details (test name, site, and error message) must be placed **at the top of the email**, clearly highlighted. The list of passed tests will follow below.

## Tasks Required from the Agent
Generate the following files to build the architecture:

1. **`package.json`**: With all necessary dependencies (`@playwright/test`, `nodemailer`, etc.) and the start scripts (`npm run monitor`, `npm run report`).
2. **`playwright.config.ts`**: Configured in TypeScript with the separated projects, multiple reporters (JSON, HTML), and the logic for the dynamically versioned directory.
3. **Two simple example tests**: To be placed in the `tests/site_a/example.spec.ts` and `tests/site_b/example.spec.ts` folders to demonstrate isolation.
4. **`alert-system.js`**: The script that parses the JSON and sends the email following the error priority rules.
5. **`run-monitor.sh` (or `.js`)**: An "orchestrator" script that creates the timestamp (`RUN_ID`), starts the tests passing this environment variable, and upon test completion, starts the alert system.

## Acceptance Criteria
- The code must be clean, commented in Italian, and ready to be copy-pasted.
- Do not insert "sleep" statements in the tests; leverage Playwright's auto-waiting.
- Manage sensitive variables (email password, SMTP) via a `.env` file (use `dotenv`).
