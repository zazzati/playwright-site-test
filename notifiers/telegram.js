'use strict';
/**
 * notifiers/telegram.js
 *
 * Invia notifiche Telegram al termine di ogni test Playwright.
 * Configurazione in: telegram.config.json  { "chatId": "<chat_id>" }
 *
 * Se il file di config non esiste o chatId è null, le notifiche vengono
 * silenziosamente saltate (il test non viene bloccato).
 */

const fs   = require('fs');
const path = require('path');

const BOT_TOKEN  = (loadConfig() || {}).botToken || process.env.TELEGRAM_BOT_TOKEN;
const CONFIG_PATH = path.resolve(__dirname, '..', 'telegram.config.json');
const API_BASE   = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Re-resolve API_BASE after config is loaded (loadConfig called again below if needed)
function getApiBase() {
  const token = (loadConfig() || {}).botToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN non configurato. Esegui: npm run setup-telegram');
  return `https://api.telegram.org/bot${token}`;
}

// ─── Config ────────────────────────────────────────────────────────────────────

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function getChatId() {
  const cfg = loadConfig();
  return cfg && cfg.chatId ? String(cfg.chatId) : null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fmtDuration(ms) {
  if (ms == null) return '?';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch (_) {
    return iso;
  }
}

// ─── Telegram API calls ────────────────────────────────────────────────────────

async function sendMessage(chatId, text) {
  const res = await fetch(`${getApiBase()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`sendMessage failed: ${data.description}`);
  return data;
}

async function sendPhoto(chatId, screenshotPath, caption) {
  const form = new FormData();
  const buffer = fs.readFileSync(screenshotPath);
  form.append('chat_id', chatId);
  form.append('photo', new Blob([buffer], { type: 'image/png' }), 'screenshot.png');
  form.append('caption', caption);
  form.append('parse_mode', 'HTML');

  const res = await fetch(`${getApiBase()}/sendPhoto`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`sendPhoto failed: ${data.description}`);
  return data;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Invia una notifica Telegram al termine di un singolo test.
 *
 * @param {object} params
 * @param {string}      params.site
 * @param {string}      params.runId
 * @param {string}      params.title       - titolo del test
 * @param {string}      params.suiteName
 * @param {string}      params.status      - 'passed' | 'failed' | 'timedOut' | ...
 * @param {number}      params.duration    - ms
 * @param {string|null} params.error       - messaggio di errore (se fallito)
 * @param {string|null} params.screenshot  - path assoluto dello screenshot
 * @param {string}      params.startTime   - ISO string dell'inizio run
 */
async function sendTestResult(params) {
  const chatId = getChatId();
  if (!chatId) return; // non configurato

  const {
    site, runId, title, suiteName, status,
    duration, error, screenshot, startTime,
  } = params;

  const passed   = status === 'passed';
  const icon     = passed ? '✅' : (status === 'timedOut' ? '⏱' : '❌');
  const esito    = passed ? '✅ PASSED' : `❌ ${status.toUpperCase()}`;
  const dateStr  = fmtDate(startTime);

  // ─── Base message ────
  let msg = `${icon} <b>Test ${passed ? 'PASSATO' : 'FALLITO'}</b>\n\n`;
  msg    += `📍 <b>Site:</b> ${escapeHtml(site)}\n`;
  msg    += `📅 <b>Data:</b> ${escapeHtml(dateStr)}\n`;
  msg    += `🆔 <b>Run:</b> <code>${escapeHtml(runId)}</code>\n`;
  if (suiteName) msg += `📂 <b>Suite:</b> ${escapeHtml(suiteName)}\n`;
  msg    += `📝 <b>Test:</b> ${escapeHtml(title)}\n`;
  msg    += `⏱ <b>Durata:</b> ${fmtDuration(duration)}\n`;
  msg    += `📊 <b>Esito:</b> ${esito}`;

  // ─── Error details (only for failures) ───────────────────────────
  if (!passed && error) {
    const truncated = error.length > 600 ? error.slice(0, 600) + '…' : error;
    msg += `\n\n⚠️ <b>ERRORE:</b>\n<pre>${escapeHtml(truncated)}</pre>`;
  }

  // ─── Send ────────────────────────────────────────────────────────
  if (screenshot && fs.existsSync(screenshot)) {
    // Always attach screenshot (with full message as caption)
    const captionMax = 1024; // Telegram caption limit
    const caption = msg.length > captionMax ? msg.slice(0, captionMax - 1) + '…' : msg;
    await sendPhoto(chatId, screenshot, caption);
  } else {
    await sendMessage(chatId, msg);
  }
}

/**
 * Invia un riepilogo di tutta la run al termine.
 */
async function sendRunSummary(params) {
  const chatId = getChatId();
  if (!chatId) return;

  const { site, runId, startTime, duration, stats } = params;

  const allPassed = stats.failed === 0;
  const icon = allPassed ? '🎉' : '🚨';

  let msg = `${icon} <b>Run completata: ${escapeHtml(site)}</b>\n\n`;
  msg    += `📅 <b>Data:</b> ${escapeHtml(fmtDate(startTime))}\n`;
  msg    += `🆔 <b>Run:</b> <code>${escapeHtml(runId)}</code>\n`;
  msg    += `⏱ <b>Durata totale:</b> ${fmtDuration(duration)}\n\n`;
  msg    += `✅ Passati:  <b>${stats.passed}</b>\n`;
  msg    += `❌ Falliti:  <b>${stats.failed}</b>\n`;
  msg    += `⏭ Skippati: <b>${stats.skipped}</b>`;

  await sendMessage(chatId, msg);
}

module.exports = { sendTestResult, sendRunSummary, getChatId, loadConfig };
