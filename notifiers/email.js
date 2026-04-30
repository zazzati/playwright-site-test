'use strict';
/**
 * notifiers/email.js
 *
 * Invia notifiche via email al termine di ogni test Playwright.
 * Usa nodemailer con relay SMTP e nunjucks per i template HTML.
 * Configurazione in: email.config.json
 * Template in:       notifiers/templates/
 *
 * Se il file di config non esiste o "to" è null, le notifiche vengono
 * silenziosamente saltate (il test non viene bloccato).
 */

const fs         = require('fs');
const path       = require('path');
const nodemailer = require('nodemailer');
const nunjucks   = require('nunjucks');

const CONFIG_PATH   = path.resolve(__dirname, '..', 'email.config.json');
const TEMPLATES_DIR = path.resolve(__dirname, 'templates');

// Configura nunjucks con autoescape HTML abilitato
nunjucks.configure(TEMPLATES_DIR, { autoescape: true });

// ─── Config ────────────────────────────────────────────────────────────────────

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch (_) { return null; }
}

function getTransporter() {
  const cfg = loadConfig();
  if (!cfg || !cfg.smtp) return null;
  return nodemailer.createTransport({
    host:   cfg.smtp.host,
    port:   cfg.smtp.port ?? 587,
    secure: cfg.smtp.secure ?? false,
    auth:   { user: cfg.smtp.user, pass: cfg.smtp.pass },
  });
}

function getRecipients() {
  const cfg = loadConfig();
  if (!cfg || !cfg.to) return null;
  return Array.isArray(cfg.to) ? cfg.to.join(',') : String(cfg.to);
}

function getFrom() {
  const cfg = loadConfig();
  return cfg?.from ?? cfg?.smtp?.user ?? 'noreply@localhost';
}

function getDashboardUrl() {
  const cfg = loadConfig();
  if (cfg?.dashboardUrl) return cfg.dashboardUrl;
  const port = parseInt(process.env.REPORT_PORT || '80', 10);
  try {
    const { spawnSync } = require('child_process');
    const out = spawnSync('ip', ['route', 'get', '1'], { encoding: 'utf8' }).stdout;
    const m = out.match(/src\s+(\S+)/);
    if (m) return `http://${m[1]}${port === 80 ? '' : ':' + port}`;
  } catch (_) {}
  return `http://localhost${port === 80 ? '' : ':' + port}`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
  } catch (_) { return iso; }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Invia una notifica email al termine di un singolo test.
 *
 * @param {object} params
 * @param {string}      params.site
 * @param {string}      params.runId
 * @param {string}      params.title
 * @param {string}      params.suiteName
 * @param {string}      params.status      - 'passed' | 'failed' | 'timedOut' | ...
 * @param {number}      params.duration    - ms
 * @param {string|null} params.error
 * @param {string|null} params.screenshot  - path assoluto dello screenshot
 * @param {string}      params.startTime   - ISO string dell'inizio run
 */
async function sendTestResult(params) {
  const to = getRecipients();
  if (!to) return;
  const transporter = getTransporter();
  if (!transporter) return;

  const { site, runId, title, suiteName, status, duration, error, screenshot, startTime } = params;
  const passed       = status === 'passed';
  const icon         = passed ? '✅' : (status === 'timedOut' ? '⏱' : '❌');
  const hasScreenshot = !passed && !!screenshot && fs.existsSync(screenshot);

  const html = nunjucks.render('test-result.html', {
    icon,
    passed,
    site,
    runId,
    suiteName,
    title,
    status,
    duration:     fmtDuration(duration),
    error:        error && error.length > 1000 ? error.slice(0, 1000) + '…' : (error ?? null),
    dateStr:      fmtDate(startTime),
    dashboardUrl: getDashboardUrl(),
    hasScreenshot,
  });

  const subject = `${icon} [${site}] Test ${status.toUpperCase()}: ${title}`;
  const mailOptions = { from: getFrom(), to, subject, html };

  if (hasScreenshot) {
    mailOptions.attachments = [{
      filename: 'screenshot.png',
      path:     screenshot,
      cid:      'screenshot',
    }];
  }

  await transporter.sendMail(mailOptions);
}

/**
 * Invia un riepilogo via email al termine di tutta la run.
 */
async function sendRunSummary(params) {
  const to = getRecipients();
  if (!to) return;
  const transporter = getTransporter();
  if (!transporter) return;

  const { site, runId, startTime, duration, stats } = params;
  const icon = stats.failed === 0 ? '🎉' : '🚨';

  const html = nunjucks.render('run-summary.html', {
    icon,
    site,
    runId,
    stats,
    duration:     fmtDuration(duration),
    dateStr:      fmtDate(startTime),
    dashboardUrl: getDashboardUrl(),
  });

  const subject = `${icon} [${site}] Run completata — ✅ ${stats.passed} passati, ❌ ${stats.failed} falliti`;
  await transporter.sendMail({ from: getFrom(), to, subject, html });
}

module.exports = { sendTestResult, sendRunSummary, getRecipients, loadConfig };
