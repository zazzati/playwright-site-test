/**
 * show-report.js
 * Server HTTP leggero che legge test-results/ e serve una pagina HTML
 * con vista gerarchica:  Sito → Run → Test → Steps → Screenshot finale.
 *
 * Usi:
 *   node show-report.js                                 → tutti i siti
 *   PROJECT_NAME=csipiemonte node show-report.js        → solo un sito
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const PORT = parseInt(process.env.REPORT_PORT || '9323', 10);
const RESULTS_DIR = path.resolve('test-results');
const SITE_FILTER = process.env.PROJECT_NAME || null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Data loading ─────────────────────────────────────────────────────────────

function loadAllData() {
  const data = {};
  if (!fs.existsSync(RESULTS_DIR)) return data;

  const sites = fs
    .readdirSync(RESULTS_DIR)
    .filter((d) => fs.statSync(path.join(RESULTS_DIR, d)).isDirectory())
    .filter((d) => !SITE_FILTER || d === SITE_FILTER)
    .sort();

  for (const site of sites) {
    const siteDir = path.join(RESULTS_DIR, site);
    const runs = fs
      .readdirSync(siteDir)
      .filter((d) => d.startsWith('run_'))
      .sort()
      .reverse();

    if (runs.length === 0) continue;
    data[site] = [];

    for (const run of runs) {
      const runDir = path.join(siteDir, run);
      const reportDataPath = path.join(runDir, 'report-data.json');

      if (fs.existsSync(reportDataPath)) {
        try {
          data[site].push(JSON.parse(fs.readFileSync(reportDataPath, 'utf8')));
        } catch (e) {
          data[site].push({ site, runId: run, tests: [], stats: {}, error: String(e) });
        }
      } else {
        // Older run: show basic info from results.json if available
        const resultsPath = path.join(runDir, 'results.json');
        if (fs.existsSync(resultsPath)) {
          try {
            const r = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
            data[site].push({
              site,
              runId: run,
              startTime: r.stats && r.stats.startTime ? r.stats.startTime : null,
              duration: r.stats && r.stats.duration ? r.stats.duration : null,
              stats: {
                passed: (r.stats && r.stats.expected) ? r.stats.expected : 0,
                failed: (r.stats && r.stats.unexpected) ? r.stats.unexpected : 0,
                skipped: (r.stats && r.stats.skipped) ? r.stats.skipped : 0,
              },
              tests: [],
              legacy: true,
            });
          } catch (_) {
            data[site].push({ site, runId: run, tests: [], stats: {} });
          }
        }
      }
    }
  }
  return data;
}

// ─── Screenshot endpoint ──────────────────────────────────────────────────────

function serveScreenshot(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');
  const imgPath = urlObj.searchParams.get('path');

  if (!imgPath) { res.writeHead(400); return res.end('Bad Request'); }

  // Security: path must be inside RESULTS_DIR
  const resolved = path.resolve(imgPath);
  if (!resolved.startsWith(RESULTS_DIR + path.sep) && resolved !== RESULTS_DIR) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  if (!fs.existsSync(resolved)) { res.writeHead(404); return res.end('Not Found'); }

  res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'max-age=3600' });
  fs.createReadStream(resolved).pipe(res);
}

// ─── HTML page (served from dashboard.html) ──────────────────────────────────
const DASHBOARD_HTML = path.join(__dirname, 'dashboard.html');

// ─── LEGACY INLINE HTML (kept for reference, not served) ─────────────────────

const HTML = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Test Report</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f2f5;color:#1f2937}
header{background:#1a1a2e;color:#fff;padding:14px 24px;display:flex;align-items:center;gap:12px}
header h1{font-size:21px;font-weight:700}
header .subtitle{font-size:12px;color:#94a3b8;margin-left:auto}
.refresh-btn{margin-left:12px;background:#334155;border:none;color:#cbd5e1;font-size:12px;padding:4px 10px;border-radius:6px;cursor:pointer}
.refresh-btn:hover{background:#475569}
.container{max-width:1200px;margin:0 auto;padding:24px}
.site-card{background:#fff;border-radius:10px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,.08);overflow:hidden}
.site-header{padding:13px 18px;cursor:pointer;display:flex;align-items:center;gap:10px;background:#1a1a2e;color:#fff;user-select:none}
.site-header:hover{background:#16213e}
.site-title{font-size:17px;font-weight:700;flex:1}
.site-meta{font-size:12px;color:#94a3b8}
.run-item{border-top:1px solid #e5e7eb}
.run-header{padding:10px 18px;cursor:pointer;display:flex;align-items:center;gap:10px;background:#f8f9fb;user-select:none;transition:background .15s}
.run-header:hover{background:#eef0f4}
.run-id{font-size:13px;font-weight:600;color:#374151;flex:none;white-space:nowrap}
.run-date{font-size:12px;color:#6b7280;flex:1;padding:0 8px}
.run-stats{display:flex;gap:6px;align-items:center}
.run-body{padding-left:24px}
.test-item{border-top:1px solid #f0f2f5}
.test-header{padding:9px 18px;cursor:pointer;display:flex;align-items:center;gap:8px;user-select:none;transition:background .15s}
.test-header:hover{background:#f0f2f5}
.test-title{font-size:14px;flex:1}
.test-dur{font-size:11px;color:#9ca3af;white-space:nowrap}
.test-body{padding:12px 18px 18px 48px;background:#fafbfc;border-top:1px solid #f0f2f5}
.suite-name{font-size:11px;color:#9ca3af;margin-bottom:10px}
.section-title{font-size:11px;font-weight:700;color:#374151;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.steps-list{list-style:none;margin-bottom:16px}
.step-row{display:flex;align-items:baseline;gap:6px;padding:3px 0;border-bottom:1px dashed #f0f2f5}
.step-row:last-child{border-bottom:none}
.step-txt{font-size:12px;font-family:'SFMono-Regular',Consolas,monospace;flex:1;word-break:break-all}
.step-dur{font-size:11px;color:#9ca3af;white-space:nowrap}
.step-err{font-size:11px;color:#b91c1c;margin-left:18px;margin-top:2px}
.no-steps{font-size:12px;color:#9ca3af;font-style:italic;margin-bottom:12px}
.ss-img{max-width:100%;max-height:600px;object-fit:contain;border:1px solid #e5e7eb;border-radius:6px;cursor:zoom-in;display:block;margin-top:6px}
.no-ss{font-size:12px;color:#9ca3af;font-style:italic}
.error-box{background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-radius:6px;padding:8px 12px;font-size:12px;margin-bottom:12px;white-space:pre-wrap;word-break:break-word}
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap}
.bp{background:#d1fae5;color:#065f46}
.bf{background:#fee2e2;color:#991b1b}
.bs{background:#fef3c7;color:#92400e}
.bw{background:#fff7ed;color:#92400e}
.arr{display:inline-block;font-size:10px;color:#9ca3af;transition:transform .2s;flex:none}
.arr.open{transform:rotate(90deg)}
.loading{text-align:center;padding:60px;font-size:17px;color:#6b7280}
.empty{text-align:center;padding:40px;font-size:14px;color:#9ca3af;font-style:italic}
.lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.87);z-index:9999;align-items:center;justify-content:center;cursor:zoom-out}
.lightbox.on{display:flex}
.lightbox img{max-width:96vw;max-height:96vh;object-fit:contain;border-radius:4px}
</style>
</head>
<body>
<header>
  <span style="font-size:22px">📊</span>
  <h1>Test Report Dashboard</h1>
  <span class="subtitle" id="ts"></span>
  <button class="refresh-btn" onclick="init()">&#x21BB; Aggiorna</button>
</header>
<div class="container" id="app"><div class="loading">&#x23F3; Caricamento&hellip;</div></div>
<div class="lightbox" id="lb" onclick="closeLB()"><img id="lb-img" src="" alt="screenshot"></div>
<script>
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function dur(ms){return ms==null?'':ms<1000?ms+'ms':(ms/1000).toFixed(1)+'s'}
function fmtDate(iso){if(!iso)return '';try{return new Date(iso).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})}catch(e){return iso}}
function badge(s){if(s==='passed')return '<span class="badge bp">&#x2705; passed</span>';if(s==='failed')return '<span class="badge bf">&#x274C; failed</span>';if(s==='timedOut')return '<span class="badge bf">&#x23F1; timeout</span>';return '<span class="badge bs">&#x23ED; '+esc(s)+'</span>'}
var _id=0;function uid(){return 'e'+(++_id)}
function toggle(hid){var h=document.getElementById(hid);var b=document.getElementById(h.dataset.body);var a=h.querySelector('.arr');if(!b||!a)return;var hidden=b.style.display==='none';b.style.display=hidden?'':'none';a.classList.toggle('open',hidden)}
function openLB(src,e){if(e)e.stopPropagation();document.getElementById('lb-img').src=src;document.getElementById('lb').classList.add('on')}
function closeLB(){document.getElementById('lb').classList.remove('on')}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeLB()});

function renderSteps(steps){
  if(!steps||steps.length===0)return '<p class="no-steps">Nessuno step registrato &mdash; gli step saranno visibili dalla prossima esecuzione.</p>';
  var rows=steps.map(function(s){
    var color=s.category==='expect'?'#7c3aed':s.category==='test.step'?'#0369a1':'#1f2937';
    var icon=s.error?'&#x274C;':'&#x2705;';
    return '<li><div class="step-row"><span style="font-size:12px;flex:none">'+icon+'</span>'
      +'<span class="step-txt" style="color:'+color+'">'+esc(s.title)+'</span>'
      +'<span class="step-dur">'+dur(s.duration)+'</span></div>'
      +(s.error?'<div class="step-err">'+esc(s.error.slice(0,300))+'</div>':'')
      +'</li>';
  });
  return '<ul class="steps-list">'+rows.join('')+'</ul>';
}

function renderTest(test){
  var hid=uid(),bid=uid();
  var ss=test.screenshot
    ?'<img class="ss-img" src="/img?path='+encodeURIComponent(test.screenshot)+'" alt="screenshot" loading="lazy" onclick="openLB(this.src,event)">'
    :'<p class="no-ss">Nessuno screenshot disponibile</p>';
  return '<div class="test-item">'
    +'<div class="test-header" id="'+hid+'" data-body="'+bid+'" onclick="toggle(this.id)">'
    +'<span class="arr">&#x25B6;</span>'
    +badge(test.status)
    +'<span class="test-title">'+esc(test.title)+'</span>'
    +'<span class="test-dur">'+dur(test.duration)+'</span>'
    +'</div>'
    +'<div id="'+bid+'" class="test-body" style="display:none">'
    +(test.suiteName?'<div class="suite-name">Suite: '+esc(test.suiteName)+'</div>':'')
    +(test.error?'<div class="error-box">'+esc(test.error.slice(0,500))+'</div>':'')
    +'<div class="section-title">Steps</div>'
    +renderSteps(test.steps)
    +'<div class="section-title" style="margin-top:12px">Screenshot finale</div>'
    +ss
    +'</div></div>';
}

function renderRun(run){
  var hid=uid(),bid=uid();
  var p=run.stats&&run.stats.passed!=null?run.stats.passed:0;
  var f=run.stats&&run.stats.failed!=null?run.stats.failed:0;
  var sk=run.stats&&run.stats.skipped!=null?run.stats.skipped:0;
  var ok=f===0;
  var statsHtml='<span class="badge '+(ok?'bp':'bf')+'">'+(ok?'&#x2705;':'&#x274C;')+' '+p+'P / '+f+'F / '+sk+'S</span>'
    +(run.duration?'&nbsp;<span style="font-size:11px;color:#9ca3af">'+dur(run.duration)+'</span>':'');
  var legacy=run.legacy?'&nbsp;<span class="badge bw">report precedente</span>':'';
  var tests=run.tests||[];
  var testsHtml=tests.length>0
    ?tests.map(renderTest).join('')
    :'<div class="empty">'+(run.legacy?'Run eseguita prima del reporter personalizzato &mdash; riesegui i test per vedere gli step.':'Nessun test in questo run.')+'</div>';
  return '<div class="run-item">'
    +'<div class="run-header" id="'+hid+'" data-body="'+bid+'" onclick="toggle(this.id)">'
    +'<span class="arr">&#x25B6;</span>'
    +'<span class="run-id">'+esc(run.runId||'')+'</span>'
    +'<span class="run-date">'+fmtDate(run.startTime)+'</span>'
    +'<span class="run-stats">'+statsHtml+legacy+'</span>'
    +'</div>'
    +'<div id="'+bid+'" class="run-body" style="display:none">'+testsHtml+'</div>'
    +'</div>';
}

function renderSite(name,runs){
  var hid=uid(),bid=uid();
  var anyFail=runs.some(function(r){return (r.stats&&r.stats.failed)?r.stats.failed>0:false});
  return '<div class="site-card">'
    +'<div class="site-header" id="'+hid+'" data-body="'+bid+'" onclick="toggle(this.id)">'}
    +'<span style="font-size:18px">&#x1F310;</span>'
    +'<span class="site-title">'+esc(name)+'</span>'
    +'<span class="site-meta">'+runs.length+' run &nbsp;'+(anyFail?'&#x274C;':'&#x2705;')+'</span>'
    +'<span class="arr open" style="margin-left:8px">&#x25B6;</span>'
    +'</div>'
    +'<div id="'+bid+'">'+runs.map(renderRun).join('')+'</div>'
    +'</div>';
}

async function init(){
  var app=document.getElementById('app');
  app.innerHTML='<div class="loading">&#x23F3; Caricamento&hellip;</div>';
  document.getElementById('ts').textContent='';
  try{
    var res=await fetch('/api/data');
    var data=await res.json();
    var sites=Object.keys(data);
    document.getElementById('ts').textContent='Aggiornato: '+new Date().toLocaleTimeString('it-IT');
    if(sites.length===0){
      app.innerHTML='<div class="empty">Nessun risultato trovato. Esegui prima: <code>npm run run</code></div>';
      return;
    }
    app.innerHTML=sites.map(function(s){return renderSite(s,data[s])}).join('');
  }catch(err){
    app.innerHTML='<div class="empty">Errore caricamento: '+esc(err.message)+'</div>';
  }
}
init();
</script>
</body>
</html>`;

// ─── HTTP Server ──────────────────────────────────────────────────────────────

const server = http.createServer(function(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');

  if (urlObj.pathname === '/api/data') {
    const data = loadAllData();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(data));
  }

  if (urlObj.pathname === '/img') {
    return serveScreenshot(req, res);
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(DASHBOARD_HTML, 'utf8'));
});

server.listen(PORT, '0.0.0.0', function() {
  const ip = getServerIP();
  console.log('');
  console.log('📊 Report server avviato — aprire nel browser:');
  console.log('   http://' + ip + ':' + PORT);
  console.log('');
  console.log('   (premi Ctrl+C per fermare il server)');
  console.log('');
});
