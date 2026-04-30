# Quickstart

Guida rapida per installare ed eseguire il framework su Linux.

---

## Installazione su Linux

### Prerequisiti

```bash
# Node.js 18+ (consigliato: installare via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts

# Verifica versioni
node --version   # v20.x o superiore
npm --version
```

### Setup del progetto

```bash
# 1. Clona il repository
git clone https://github.com/zazzati/playwright-site-test.git
cd playwright-site-test

# 2. Installa le dipendenze Node.js
npm install

# 3. Installa i browser Playwright (Chromium, Firefox, WebKit)
npx playwright install --with-deps
```

### Configurazione (opzionale)

```bash
# Copia il file di esempio per le variabili d'ambiente
cp .env.example .env

# Per le notifiche Telegram, copia e configura il file:
cp telegram.config.json.example telegram.config.json
# poi esegui il wizard di configurazione:
npm run setup-telegram
```

---

## Esecuzione dei test

```bash
# Esegui tutti i siti in sequenza (metodo raccomandato)
npm run run

# Esegui solo un sito specifico
node scripts/run-tests.js --site=csipiemonte

# Esecuzione diretta con Playwright CLI
npm test
```

L'output mostra il progresso in tempo reale. Al termine, i risultati sono salvati in `test-results/`.

---

## Dove sono i test

```
tests/
└── csipiemonte/
    └── example.spec.ts   ← test per il sito CSI Piemonte
```

Ogni sito ha la propria sottocartella in `tests/`. Per aggiungere un nuovo sito:
1. Crea `tests/<nome_sito>/` con i file `.spec.ts`
2. Aggiungi il progetto in `playwright.config.ts` nella sezione `projects`

---

## Dove sono i report

I risultati di ogni esecuzione vengono salvati in:

```
test-results/
└── <nome_sito>/
    └── run_YYYY-MM-DD_HH-MM-SS/
        ├── results.json        ← dati grezzi JSON (Playwright)
        ├── report-data.json    ← dati step + screenshot (reporter custom)
        ├── html/               ← report HTML Playwright (apri index.html)
        └── artifacts/          ← screenshot, video, trace
```

Il sistema conserva automaticamente le ultime **5 run** per sito, eliminando le più vecchie.

### Visualizzare i report nel browser

```bash
# Avvia il server della dashboard (richiede sudo per la porta 80)
sudo npm run report

# Oppure su una porta libera senza sudo
REPORT_PORT=8080 npm run report
# poi apri: http://localhost:8080
```

La dashboard mostra tutti i siti, le run, i singoli test con steps e screenshot.
