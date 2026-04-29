#!/usr/bin/env node
/**
 * scripts/setup-telegram.js
 *
 * Configurazione one-time del bot Telegram.
 * Salva il chat_id in telegram.config.json.
 *
 * Utilizzo:
 *   node scripts/setup-telegram.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN || (() => {
  try { return JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname,'..','telegram.config.json'),'utf8')).botToken; } catch(_){}
  return null;
})();
if (!BOT_TOKEN) {
  console.error('❌  TELEGRAM_BOT_TOKEN non trovato.\n   Imposta la variabile d\'ambiente TELEGRAM_BOT_TOKEN oppure inseriscila in telegram.config.json');
  process.exit(1);
}
const CONFIG_PATH = path.resolve(__dirname, '..', 'telegram.config.json');
const API_BASE    = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function getUpdates(offset) {
  const url = `${API_BASE}/getUpdates?timeout=5${offset ? `&offset=${offset}` : ''}`;
  const res  = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(`getUpdates failed: ${data.description}`);
  return data.result;
}

async function sendMessage(chatId, text) {
  await fetch(`${API_BASE}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║     Setup Bot Telegram @playwrightnotifier   ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // Check if already configured
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (cfg.chatId) {
        console.log(`✅  Bot già configurato!`);
        console.log(`   Chat ID: ${cfg.chatId}`);
        console.log('');
        console.log('   Per riconfigurare cancella telegram.config.json e riesegui il setup.');
        return;
      }
    } catch (_) {}
  }

  console.log('📱  Per configurare il bot:');
  console.log('');
  console.log('   1. Apri Telegram e cerca:  @playwrightnotifier_bot');
  console.log('   2. Premi "Start" oppure invia il messaggio:  /start');
  console.log('');
  console.log('⏳  In attesa del messaggio (60 secondi)…');
  console.log('');

  let offset    = null;
  let found     = null;
  const timeout = Date.now() + 60_000;

  while (Date.now() < timeout && !found) {
    try {
      const updates = await getUpdates(offset);
      for (const upd of updates) {
        offset = upd.update_id + 1;
        if (upd.message) {
          found = upd.message.chat;
          break;
        }
      }
    } catch (e) {
      console.error('  Errore API:', e.message);
    }
    if (!found) await new Promise(r => setTimeout(r, 2000));
  }

  if (!found) {
    console.error('❌  Timeout scaduto senza ricevere messaggi. Riprova.');
    process.exit(1);
  }

  const chatId = found.id;
  const name   = [found.first_name, found.last_name].filter(Boolean).join(' ')
               || found.username || String(chatId);

  const config = { botToken: BOT_TOKEN, chatId: String(chatId), userName: name };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  console.log(`✅  Chat ID ricevuto da: ${name} (${chatId})`);
  console.log(`   Salvato in: telegram.config.json`);
  console.log('');

  // Send confirmation message
  try {
    await sendMessage(chatId,
      `🤖 <b>Bot configurato con successo!</b>\n\n` +
      `Riceverai notifiche per ogni test Playwright eseguito.\n\n` +
      `<i>Powered by @playwrightnotifier_bot</i>`
    );
    console.log('📬  Messaggio di conferma inviato su Telegram!');
  } catch (e) {
    console.warn('  (Impossibile inviare messaggio di conferma:', e.message + ')');
  }
  console.log('');
}

main().catch(e => { console.error('ERRORE:', e.message); process.exit(1); });
